# @selfage/message

Utilities that keep plain JavaScript/TypeScript data in sync with a shared schema. Define the shape of a "message" once and use the helpers in this package to validate, clone, compare, stringify, and turn that data into a compact binary buffer.

## Why use it

- Schema-aware tools without a heavy runtime: describe fields once and reuse the same descriptor everywhere.
- Deterministic binary format for moving structured data between workers, processes, or services.
- Safer handling of untrusted input by filtering to known fields and types.
- Convenient helpers for deep copy, equality checks, and stable JSON output, all driven by the same descriptor.
- Optional CLI to serialize/deserialize from the command line for debugging or quick integrations.

## Install

```bash
npm install @selfage/message
```

## Core idea

A *message descriptor* is a plain object that lists every field in a message, its numeric index, and how that field should be treated (number, boolean, string, enum, nested message, or array). Descriptors can be generated or hand-written. Once you have one, every API in this package accepts that descriptor to understand the shape of your data.

```ts
import {
  PrimitiveType,
  MessageDescriptor,
  serializeMessage,
  deserializeMessage,
  parseMessage,
} from "@selfage/message";

interface User {
  id?: number;
  nickname?: string;
  active?: boolean;
}

const USER: MessageDescriptor<User> = {
  name: "User",
  fields: [
    { name: "id", index: 1, primitiveType: PrimitiveType.NUMBER },
    { name: "nickname", index: 2, primitiveType: PrimitiveType.STRING },
    { name: "active", index: 3, primitiveType: PrimitiveType.BOOLEAN },
  ],
};

const illFormedUser: any = {
  id: "12",
  nickname: "Ada",
  active: "yes",
  extraField: "ignored",
};

const parsed = parseMessage(illFormedUser, USER);
// parsed becomes { id: undefined, nickname: "Ada", active: undefined }

// If sent over the wire:
const user: User = { id: 12, nickname: "Ada", active: true };
const binary = serializeMessage(user, USER);
const roundTrip = deserializeMessage(binary, USER);
// roundTrip is now { id: 12, nickname: "Ada", active: true }
```

## Generating descriptors

Rather than hand-writing descriptor files, you can also generate them with `@selfage/generator_cli`. The tool reads a schema file and emits the TypeScript interface alongside the matching descriptor object.

```bash
npm install --save-dev @selfage/generator_cli

# definition.yaml must sit in the working directory; omit the .yaml suffix if you like
npx geneage ./definition.yaml
```

And the `definition.yaml` looks like:

```yaml
- kind: Message
  name: User
  fields:
    - { name: id, type: number, index: 1 }
    - { name: nickname, type: string, index: 2 }
    - { name: active, type: boolean, index: 3 }
```

The generated module exports the same pair as the example above (a `User` interface and `USER` descriptor), ready to import into your project.

## Everyday helpers

- `parseMessage(raw, descriptor)` filters an arbitrary object, keeping only fields that match the descriptor and coercing enums/primitive types.
- `copyMessage(from, descriptor, to?)` deep-clones a message (optionally into an existing object) while reusing typed arrays and nested objects safely.
- `equalMessage(left, right, descriptor)` performs structural equality on messages, including nested objects and arrays.
- `stringifyMessage(message, descriptor)` produces an index-based JSON string that is stable and language-neutral; `destringifyMessage(raw, descriptor)` reverses the process.
- `serializeMessage(message, descriptor)` and `deserializeMessage(binary, descriptor)` convert between objects and the compact binary wire format shown in `serializer.ts`.

Helpers ignore unknown fields, drop singular fields that are `null`/`undefined`, and keep array positions even when the element value becomes `undefined`.

## Command line usage

Install locally (as shown above) or run via `npx`:

```bash
# Serialize a JSON object using a descriptor exported from ./descriptor.js
npx message serialize '{"id":1,"nickname":"Ada"}' \
  --encoding hex \
  --descriptor-file ./descriptor \
  --descriptor-name USER

# Deserialize a base64 string back into JSON
npx message deserialize "AQAAAA..." \
  --encoding base64 \
  --descriptor-file ./descriptor \
  --descriptor-name USER
```

The CLI dynamically imports the descriptor file, so it works with either `.js` or `.ts` sources (set `--descriptor-file` without the extension).

## Behavior notes

- Default buffer size is 16 MB; call `initBuffer(newSize)` before serializing if you need to handle larger messages.
- Field and enum indexes must fit inside a 32-bit unsigned integer. String lengths share the same limit (max `2^32 - 1` bytes).
- The library expects descriptors to list fields in ascending `index` order. This ensures fast lookups during deserialization.
- Singular fields skip serialization when the value is `undefined` *or* `null`, so deserialization produces `undefined`. Within arrays the element slot is preserved, but `null` or `undefined` entries come back as `undefined`.

With these building blocks you can keep your data definitions in one place and rely on a single set of utilities—from validation to binary transport—to keep messages consistent across your project.
