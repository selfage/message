import { deserializeMessage, serializeMessage } from "./serializer";
import { destringifyMessage, stringifyMessage } from "./stringifier";
import { Color, NESTED_USER, NestedUser, USER, User } from "./test_data/user";
import { TEST_RUNNER } from "@selfage/test_runner";
import { BSON } from "bson";

function measureElapsedTime(func: () => void, times: number) {
  let start = Date.now();
  for (let i = 0; i < times; i++) {
    func();
  }
  return Date.now() - start;
}

function buildLongString(length: number): string {
  let array = new Array<string>();
  for (let i = 0; i < length; i++) {
    array.push("a");
  }
  return array.join("");
}

let STANDARD_USER: User = {
  id: 12,
  isPaid: true,
  nickname: "jack",
  email: undefined,
  idHistory: [11, 20, undefined, 855],
  isPaidHistory: [true, undefined, false],
  nicknameHistory: ["queen", undefined, "king"],
};
let STANDARD_NESTED_USER: NestedUser = {
  id: 25,
  userInfo: {
    intro: "student",
    backgroundColor: Color.RED,
    preferredColor: 1,
    colorHistory: [Color.GREEN, undefined],
  },
  creditCards: [{ cardNumber: 1010 }, {}, undefined],
};
let LONG_STRING_USER: User = {
  id: 1724376865342,
  nickname: buildLongString(10000),
  idHistory: [1724376865342, 1724376865342, 1724376865342, 1724376865342],
  nicknameHistory: [
    buildLongString(10000),
    buildLongString(10000),
    buildLongString(10000),
  ],
};

TEST_RUNNER.run({
  name: "SerializerBenchmarkTest",
  cases: [
    {
      name: "CompareSerializedSize",
      execute: () => {
        // Execute
        let binary = serializeMessage(STANDARD_USER, USER);
        let stringfied = stringifyMessage(STANDARD_USER, USER);
        let bsoned = BSON.serialize(STANDARD_USER);
        let json = JSON.stringify(STANDARD_USER);

        // Output
        console.log(
          `Sizes: serialize: ${binary.byteLength}; stringify: ${new TextEncoder().encode(stringfied).byteLength}; bson: ${bsoned.byteLength}; JSON: ${new TextEncoder().encode(json).byteLength};`,
        );
      },
    },
    {
      name: "CompareSerializedSizeNested",
      execute: () => {
        // Execute
        let binary = serializeMessage(STANDARD_NESTED_USER, NESTED_USER);
        let stringfied = stringifyMessage(STANDARD_NESTED_USER, NESTED_USER);
        let bsoned = BSON.serialize(STANDARD_NESTED_USER);
        let json = JSON.stringify(STANDARD_NESTED_USER);

        // Output
        console.log(
          `Sizes: serialize: ${binary.byteLength}; stringify: ${new TextEncoder().encode(stringfied).byteLength}; bson: ${bsoned.byteLength}; JSON: ${new TextEncoder().encode(json).byteLength};`,
        );
      },
    },
    {
      name: "CompareSerializedSizeLargeNumberAndString",
      execute: () => {
        // Execute
        let binary = serializeMessage(LONG_STRING_USER, USER);
        let stringfied = stringifyMessage(LONG_STRING_USER, USER);
        let bsoned = BSON.serialize(LONG_STRING_USER);
        let json = JSON.stringify(LONG_STRING_USER);

        // Output
        console.log(
          `Sizes: serialize: ${binary.byteLength}; stringify: ${new TextEncoder().encode(stringfied).byteLength}; bson: ${bsoned.byteLength}; JSON: ${new TextEncoder().encode(json).byteLength};`,
        );
      },
    },
    {
      name: "CompareSerializationSpeed",
      execute: () => {
        // Execute
        let serializeElapsed = measureElapsedTime(
          () => serializeMessage(STANDARD_USER, USER),
          100000,
        );
        let stringifiyElapsed = measureElapsedTime(
          () => stringifyMessage(STANDARD_USER, USER),
          100000,
        );
        let bsonSerializeElapsed = measureElapsedTime(
          () => BSON.serialize(STANDARD_USER),
          100000,
        );
        let jsonStringifyElapsed = measureElapsedTime(
          () => JSON.stringify(STANDARD_USER),
          100000,
        );

        // Output
        console.log(
          `Serialization speed: serialize: ${serializeElapsed}; stringifiy: ${stringifiyElapsed}; BSON: ${bsonSerializeElapsed}; JSON: ${jsonStringifyElapsed};`,
        );
      },
    },
    {
      name: "CompareSerializationOfNestedStructureSpeed",
      execute: () => {
        // Execute
        let serializeElapsed = measureElapsedTime(
          () => serializeMessage(STANDARD_NESTED_USER, NESTED_USER),
          100000,
        );
        let stringifiyElapsed = measureElapsedTime(
          () => stringifyMessage(STANDARD_NESTED_USER, NESTED_USER),
          100000,
        );
        let bsonSerializeElapsed = measureElapsedTime(
          () => BSON.serialize(STANDARD_NESTED_USER),
          100000,
        );
        let jsonStringifyElapsed = measureElapsedTime(
          () => JSON.stringify(STANDARD_NESTED_USER),
          100000,
        );

        // Output
        console.log(
          `Serialization speed: serialize: ${serializeElapsed}; stringifiy: ${stringifiyElapsed}; BSON: ${bsonSerializeElapsed}; JSON: ${jsonStringifyElapsed};`,
        );
      },
    },
    {
      name: "CompareSerializationOfLongStringSpeed",
      execute: () => {
        // Execute
        let serializeElapsed = measureElapsedTime(
          () => serializeMessage(LONG_STRING_USER, USER),
          10000,
        );
        let stringifiyElapsed = measureElapsedTime(
          () => stringifyMessage(LONG_STRING_USER, USER),
          10000,
        );
        let bsonSerializeElapsed = measureElapsedTime(
          () => BSON.serialize(LONG_STRING_USER),
          10000,
        );
        let jsonStringifyElapsed = measureElapsedTime(
          () => JSON.stringify(LONG_STRING_USER),
          10000,
        );

        // Output
        console.log(
          `Serialization speed: serialize: ${serializeElapsed}; stringifiy: ${stringifiyElapsed}; BSON: ${bsonSerializeElapsed}; JSON: ${jsonStringifyElapsed};`,
        );
      },
    },
    {
      name: "CompareDeserializationSpeed",
      execute: () => {
        // Execute
        let raw: any = serializeMessage(STANDARD_USER, USER);
        let deserializeElapsed = measureElapsedTime(
          () => deserializeMessage(raw, USER),
          100000,
        );
        raw = stringifyMessage(STANDARD_USER, USER);
        let destringifiyElapsed = measureElapsedTime(
          () => destringifyMessage(raw, USER),
          100000,
        );
        raw = BSON.serialize(STANDARD_USER);
        let bsonDeserializeElapsed = measureElapsedTime(
          () => BSON.deserialize(raw),
          100000,
        );
        raw = JSON.stringify(STANDARD_USER);
        let jsonParseElapsed = measureElapsedTime(
          () => JSON.parse(raw),
          100000,
        );

        // Output
        console.log(
          `Deserialization speed: deserialize: ${deserializeElapsed}; destringifiy: ${destringifiyElapsed}; BSON: ${bsonDeserializeElapsed}; JSON: ${jsonParseElapsed};`,
        );
      },
    },
    {
      name: "CompareDeserializationOfNestedStructureSpeed",
      execute: () => {
        // Execute
        let raw: any = serializeMessage(STANDARD_NESTED_USER, NESTED_USER);
        let deserializeElapsed = measureElapsedTime(
          () => deserializeMessage(raw, NESTED_USER),
          100000,
        );
        raw = stringifyMessage(STANDARD_NESTED_USER, NESTED_USER);
        let destringifiyElapsed = measureElapsedTime(
          () => destringifyMessage(raw, NESTED_USER),
          100000,
        );
        raw = BSON.serialize(STANDARD_NESTED_USER);
        let bsonDeserializeElapsed = measureElapsedTime(
          () => BSON.deserialize(raw),
          100000,
        );
        raw = JSON.stringify(STANDARD_NESTED_USER);
        let jsonParseElapsed = measureElapsedTime(
          () => JSON.parse(raw),
          100000,
        );

        // Output
        console.log(
          `Deserialization speed: deserialize: ${deserializeElapsed}; destringifiy: ${destringifiyElapsed}; BSON: ${bsonDeserializeElapsed}; JSON: ${jsonParseElapsed};`,
        );
      },
    },
  ],
});
