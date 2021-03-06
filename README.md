# @selfage/message

## Install

`npm install @selfage/message`

## Overview

Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides a TypeScript interface `MessageDescriptor` to describe messages even at runtime, which can then be used to parse/cast `any` TypeScript objects into type-safe objects.

The term "message" stands for data class, inspired from Google's Protocol Buffers, i.e., in JavaScript/TypeScript case, an object without any functions defined on it, which is what can be communicated between different threads, processes, or distributed servers.

TypeScript uses interfaces to describe objects at compiling time, checking for invalid references to object fields/properties. However, in cases such as casting `JSON.parse(...)` to a type-safe object, `JSON.parse(...) as MyData` doesn't really validate fields for you and thus you don't get a real type-safe object.

`MessageDescriptor` which holds type information of messages even at runtime can then be helpful. It's typically generated by using `@selfage/cli` to save some typings.

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
      "type": "string",
      "isArray": true
    }]
  }
}]
```

It's just like a TypeScript interface but a little bit verbose when written in JSON. The schema of the JSON file is an array of [Definition](https://github.com/selfage/cli/blob/0f724015a4ea309d80ff231db555fe0383c91329/generate/definition.ts#L73).

After running `$ selfage gen basic`, you will get a `basic.ts` file, which looks like the follwing.

```TypeScript
import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

export interface BasicData {
  numberField?: number,
  stringArrayField?: Array<string>
}

export let BASIC_DATA: MessageDescriptor<BasicData> = {
  name: 'BasicData',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: 'numberField',
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'stringArrayField',
      primitiveType: PrimitiveType.STRING,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
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

## Parse enums at runtime

Also because TypeScript perserves enum information at runtime. The following parser is mainly used when parsing messages.

```TypeScript
import { parseEnum } from '@selfage/message/parser';
import { COLOR, Color } from './color'; // As generated from the example above.

let raw = 1 as any;
let blue = parseEnum(raw, COLOR); // of type Color.
let raw2 = 'RED' as any;
let red = parseEnum(raw2, COLOR); // of type Color.
```

## Generate observable message

`@selfage/cli` can also generate observable messages which expose listeners on changes happen on each property/member/field, by specifying `isObservable: true`. Taken the example `basic.json` above and modified as the following.

```JSON
[{
  "message": {
    "name": "BasicData",
    "fields": [{
      "name": "numberField",
      "type": "number"
    }, {
      "name": "stringArrayField",
      "type": "string",
      "isArray": true
    }],
    "isObservable": true
  }
}]
```

After running `$ selfage gen basic`, you will get a `basic.ts` file, which looks like the follwing.

```TypeScript
export class BasicData {
  public onNumberFieldChange: (newValue: number, oldValue: number) => void;
  private numberField_?: number;
  get numberField(): number {
    return this.numberField_;
  }
  set numberField(value: number) {
    let oldValue = this.numberField_;
    if (value === oldValue) {
      return;
    }
    this.numberField_ = value;
    if (this.onNumberFieldChange) {
      this.onNumberFieldChange(this.numberField_, oldValue);
    }
  }

  public onStringArrayFieldChange: (newValue: ObservableArray<string>, oldValue: ObservableArray<string>) => void;
  private stringArrayField_?: ObservableArray<string>;
  get stringArrayField(): ObservableArray<string> {
    return this.stringArrayField_;
  }
  set stringArrayField(value: ObservableArray<string>) {
    let oldValue = this.stringArrayField_;
    if (value === oldValue) {
      return;
    }
    this.stringArrayField_ = value;
    if (this.onStringArrayFieldChange) {
      this.onStringArrayFieldChange(this.stringArrayField_, oldValue);
    }
  }
  
  public toJSON(): Object {
    return {
      numberField: this.numberField;
      stringArrayField: this.stringArrayField;
    };
  }
}

export let BASIC_DATA: MessageDescriptor<BasicData> = {
  name: 'BasicData',
  factoryFn: () => {
    return new BasicData();
  },
  fields: [
    {
      name: 'numberField',
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'stringArrayField',
      primitiveType: PrimitiveType.STRING,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
  ]
};
```

It's recommended to commit `basic.ts` as a source file such that any code change on `@selfage/cli` will not break your program. Note that you will need to install `@selfage/observable_array` if your observable message contains arrays.

## Listen on observable message

Changes are detected through TypeScript setter. Listeners can be added as the following.

```TypeScript
import { BasicData } from './basic';
import { ObservableArray } from '@selfage/observable_array'; // Install @selfage/observable_array

let basicData = new BasicData();
basicData.onNumberFieldChange = (newValue, oldValue) => {
  console.log(`newValue: ${newValue}; oldValue: ${oldValue};`);
}
basicData.numberField = 10;
// Print: newValue: 10; oldValue: undefined;
basicData.numberField = 100;
// Print: newValue: 100; oldValue: 10;
delete basicData.numberField;
// Actually does nothing. basicData.numberField is still 100.
basicData.numberField = undefined;
// Print: newValue: undefined; oldValue: 100;

basicData.onStringArrayFieldChange = (newValue, oldValue) => {
  console.log(`newValue: ${JSON.stringify(newValue)}; oldValue: ${JSON.stringify(oldValue)};`);
}
basicData.stringArrayField = ObservableArray.of('str1', 'str2');
// Print: newValue: ['str1','str2']; oldValue: undefined;
basicData.stringArrayField = ObservableArray.of('str1', 'str2');
// Print: newValue: ['str1','str2']; oldValue: ['str1','str2'];
// This is because the new and old ObservableArray's are not the instance. I.e., they are not equal by `===`.
basicData.stringArrayField.push('str3');
// Nothing to print as changes are not bubbled up.
```

In order to observe arrays, please add a listener on `basicData.stringArrayField` directly. Refer to package `@selfage/observable_array` for explanation.

Changes on `BasicData` are not bubbled up either, even if you nest `BasicData` inside another observable message. Always add listeners on nested observable messages directly.

## Parse observable messages at runtime

Not only we have generated an observable message but also a `MessageDescriptor` in the example above. With that, you can parse a JSON-parsed object into an observable message the same way as a non-observable message.

```TypeScript
import { parseMessage } from '@selfage/message/parser';
import { BASIC_DATA, BasicData } from './basic'; // As generated from the example above.

let raw = JSON.parse(`{ "numberField": 111, "otherField": "random", "stringArrayField": ["str1", "str2"] }`);
let output = new BasicData();
// Providing an output argument might be preferred because you can add listeners here before parsing input.
parseMessage(raw, BASIC_DATA, output);
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

We might even introduce an index number to each field of `message`, if data size is really a concern.

## Design considerations for observable message

We have also provided `@selfage/observable_js` in pure JavaScript to convert any objects into observable objects via ES6 proxy. The main reason we didn't do the same thing in TypeScript is that we failed to find a way to make the converted observable objects type-safe. I.e., what would be the return type for function `toObservable<T>(message: T): ?` requring `on<field name>Change()` to be added to `T` and can be type checked by TypeScript?

As for why we didn't allow bubbling up changes, it's because:

1. It introduces lots of if-statements to check whether a callback function is provided.
2. Our main use case is to observe changes on states to trigger UI changes, where each component can own its own observable message/object. Nested messages/objects should be observed by nested components.
3. If you want to push new states into browser history, you probably don't want to push upon every single change, because an operation might trigger multiple changes which should be grouped into one history entry.

Exactly because of the same use case in mind, we only allow assigning one listener function to each property.