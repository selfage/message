# @selfage/message

## Install

`npm install @selfage/message`

## Overview

Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides a runtime lib for messages generated by `@selfage/cli` and helper functions to parse, copy and merge messages.

The term "message" stands for data class, inspired from Google's Protocol Buffers, i.e., in JavaScript/TypeScript case, an object without any functions defined on it, which is what can be communicated between different threads, processes, or distributed servers.

TypeScript uses interfaces to describe objects at compiling time, checking for invalid references to object fields/properties. However, in cases such as casting `JSON.parse(...)` to a type-safe object, `JSON.parse(...) as MyData` doesn't really validate fields for you and thus you don't get a real type-safe object. With `parseMessage` and the generated `MessageDescriptor`, you could then get any object validated and type-casted.

## Generate MessageDescriptor

Technically, you can generate a `MessageDescriptor` manually, or by using a generator of yours.

By using `@selfage/cli`, it requires a JSON file as input, e.g. `basic.json`, to describe the message as the following.

```JSON
[{
  "message": {
    "name": "BasicData",
    "fields": [{
      "name": "numberField",
      "type": "number"
    }, {
      "name": "stringArrayField",
      "arrayType": "string",
    }]
  }
}]
```

It's just like a TypeScript interface but a little bit verbose when written in JSON. The schema of the JSON file can be found in [@selfage/cli doc](https://github.com/selfage/cli#code-generation).

After running `$ selfage gen basic`, you will get a `basic.ts` file, which looks like the follwing.

```TypeScript
import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

export interface BasicData {
  numberField?: number,
  stringArrayField?: Array<string>
}

export let BASIC_DATA: MessageDescriptor<BasicData> = {
  name: 'BasicData',
  fields: [
    {
      name: 'numberField',
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'stringArrayField',
      primitiveType: PrimitiveType.STRING,
      isArray: true
    },
  ]
};
```

It's recommended to commit `basic.ts` as a source file such that any code change on `@selfage/cli` will not break your program.

## Parse messages at runtime

With a `MessageDescriptor`, you can then parse an `any` object into a typed object by validating each field type, e.g., from a JSON-parsed object.

```TypeScript
import { parseMessage } from '@selfage/message/parser';
import { BASIC_DATA, BasicData } from './basic'; // As generated from the example above.

let raw = JSON.parse(`{ "numberField": 111, "otherField": "random", "stringArrayField": ["str1", "str2"] }`);
let basicData = parseMessage(raw, BASIC_DATA); // Of type `BasicData`.
basicData.numberField; // 111
basicData.stringArrayField; // ["str1", "str2"]
basicData.otherField; // undefined
```

You can also supply an in-place output.

```TypeScript
// ...
let output: BasicData = {};
parseMessage(raw, BASIC_DATA, output);
```

Note that if will overwrite everything in `output`, if it's not empty.

## Generate EnumDescriptor

TypeScript preserves enum information at runtime. Therefore, `EnumDescriptor` only exists for `MessageDescriptor` to reference.

An example JSON file, `color.json`, is as the following.

```JSON
[{
  "enum": {
    "name": "Color",
    "values": [{
      "name": "RED",
      "value": 12
    }, {
      "name": "BLUE",
      "value": 1
    }]
  }
}]
```

With `@selfage/cli`, you will get `color.ts` as the following.

```TypeScript
import { EnumDescriptor } from '@selfage/message/descriptor';

export enum Color {
  RED = 12,
  BLUE = 1,
}

export let COLOR: EnumDescriptor<Color> = {
  name: 'Color',
  values: [
    {
      name: 'RED',
      value: 12,
    },
    {
      name: 'BLUE',
      value: 1,
    },
  ]
}
```

## Copy messages

Technically, `parseMessage` can be used to copy messages as well. However, `copyMessage` performs better by dropping field type checks.

```TypeScript
import { copyMessage } from '@selfage/message/copier';
import { BASIC_DATA, BasicData } from './basic'; // As generated from the example above.

let basicData: BasicData = { numberField: 111 };
let dest = copyMessage(basicData, BASIC_DATA);
// Or in-place copy.
let dest2: BasicData = {};
copyMessage(data, BASIC_DATA, dest2);
```

## Merge messages

If provided a destination/existing message, both `parseMessage` and `copyMessage` will replace every field with the new one. `mergeMessage`, however, will only overwrite a field if the corresponding new field is actually set.

```TypeScript
import { mergeMessage } from '@selfage/message/merger';
import { BASIC_DATA, BasicData } from './basic'; // As generated from the example above.

let source: BasicData = { stringArrayField: ["123"] };
let existing: BasicData = { numberField: 111 };
mergeMessage(source, BASIC_DATA, existing);
// Now `existing` becomes: { numberField: 111, stringArrayField: ["123"] }
```

## Test matcher

Provides an implementation of test matcher taking a `MessageDescriptor` to be used with `@selfage/test_matcher`.

```TypeScript
import { BasicData, BASIC_DATA } from './basic'; // As generated from the example above.
import { eqMessage } from '@selfage/message/test_matcher';
import { assertThat } from '@selfage/test_matcher'; // Install @selfage/test_matcher

let basicData: BasicData = { numberField: 111 };
assertThat(basicData, eqMessage({ numberField: 111 }, BASIC_DATA), `basicData`);
```

## Design considerations for message

We didn't invent a new language/syntax as what Google's Protocol Buffers did, because:

1. It involves a syntax parser.
2. It's not scalable, if we want to support creative attributes of messages. You might end up inventing many weird syntax.

The downside with using JSON is obviously that it's verbose to type `{}` `[]` `""` `:`, especially `"name"` a lot.

However, data size/compression has nothing to do with this approach. Because you can compress JSON strings easily with many popular tools.

We might introduce an field number to each field of `message`, when an easy-to-use compressor is identified.
