# @selfage/message

## Install

`npm install @selfage/message`

## Overview

Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides the runtime lib to be used together with `MessageDescriptor` generated by `@selfage/generator_cli`, which can parse, copy and merge messages.

The term "message" stands for data class, inspired from Google's Protocol Buffers, i.e., in JavaScript/TypeScript case, an object without any functions defined on it, which is what can be communicated between different threads, processes, or distributed servers.

TypeScript uses interfaces to describe objects at compiling time, checking for invalid references to object fields/properties. However, in cases such as casting `JSON.parse(...)` to a type-safe object, `JSON.parse(...) as MyData` doesn't really validate fields for you and thus you don't get a real type-safe object. This runtime lib together with the generated message descriptor, can help validate and type-cast objects.

See [@selfage/generate_cli#message](https://github.com/selfage/generate_cli#message) for how to generate `MessageDescriptor`. We will continue using the example generated.

## Parse messages

The typical use case is to parse a JSON object, which actually validates the fields, rather than a simple type-cast.

```TypeScript
import { parseMessage } from '@selfage/message/parser';
import { BASIC_DATA, BasicData } from './basic'; // Generated by @selfage/generator_cli.

let raw = JSON.parse(`{ "numberField": 111, "otherField": "random", "stringArrayField": ["str1", "str2"] }`);
let basicData = parseMessage(raw, BASIC_DATA); // Of type `BasicData`.
basicData.numberField; // 111
basicData.stringArrayField; // ["str1", "str2"]
basicData.otherField; // undefined
```

You can also supply an in-place output object.

```TypeScript
let output: BasicData = {};
parseMessage(raw, BASIC_DATA, output);
```

Note that it will overwrite everything in `output`.

## Copy messages

Technically, `parseMessage` can be used to copy messages as well. However, `copyMessage` performs slightly better by dropping field type checks.

```TypeScript
import { copyMessage } from '@selfage/message/copier';
import { BASIC_DATA, BasicData } from './basic'; // Generated by @selfage/generator_cli.

let basicData: BasicData = { numberField: 111 };
let dest = copyMessage(basicData, BASIC_DATA);
// Or in-place copy.
let dest2: BasicData = {};
copyMessage(data, BASIC_DATA, dest2);
```

## Merge messages

If provided with a destination/existing message, both `parseMessage` and `copyMessage` will replace every field with the new one. `mergeMessage`, however, will only overwrite a field if the corresponding new field actually has a value.

```TypeScript
import { mergeMessage } from '@selfage/message/merger';
import { BASIC_DATA, BasicData } from './basic'; // Generated by @selfage/generator_cli.

let source: BasicData = { stringArrayField: ["123"] };
let existing: BasicData = { numberField: 111 };
mergeMessage(source, BASIC_DATA, existing);
// Now `existing` becomes: { numberField: 111, stringArrayField: ["123"] }
```

## Test matcher

By importing `@selfage/message/test_matcher`, you can use it together with `@selfage/test_matcher` to match messages.

```TypeScript
import { BasicData, BASIC_DATA } from './basic'; // Generated by @selfage/generator_cli.
import { eqMessage } from '@selfage/message/test_matcher';
import { assertThat } from '@selfage/test_matcher'; // Install @selfage/test_matcher

let basicData: BasicData = { numberField: 111 };
assertThat(basicData, eqMessage({ numberField: 111 }, BASIC_DATA), `basicData`);
```

## Design considerations for message

We didn't invent a new language/syntax as what Google's Protocol Buffers did, because:

1. It involves a syntax parser.
1. It's not scalable, if we want to support creative attributes of messages. You might end up inventing many weird syntax.

The downside with using JSON is obviously that it's verbose to type `{}` `[]` `""` `:`, especially `"name"` a lot.

However, data size/compression has nothing to do with this approach. Because you can compress JSON strings easily with many popular tools.

We might introduce an field number to each field of `message`, when an easy-to-use compressor is identified.
