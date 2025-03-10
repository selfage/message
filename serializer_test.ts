import { deserializeMessage, initBuffer, serializeMessage } from "./serializer";
import { Color, NESTED_USER, NestedUser, USER, User } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import {
  MatchFn,
  assertThat,
  assertThrow,
  eq,
  eqError,
} from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

function concatArrayBuffer(buffers: Array<ArrayBuffer>) {
  let totalBytes = 0;
  for (let buffer of buffers) {
    totalBytes += buffer.byteLength;
  }
  let ret = new Uint8Array(totalBytes);
  let byteOffset = 0;
  ret.set(new Uint8Array(buffers[0]), 0);
  for (let i = 0; i < buffers.length; i++) {
    ret.set(new Uint8Array(buffers[i]), byteOffset);
    byteOffset += buffers[i].byteLength;
  }
  return ret;
}

function eqUint8Array(expected: Uint8Array): MatchFn<Uint8Array> {
  return (actual) => {
    assertThat(actual.length, eq(expected.length), "buffer length");
    for (let i = 0; i < expected.length; i++) {
      assertThat(actual[i], eq(expected[i]), `${i}th byte`);
    }
  };
}

TEST_RUNNER.run({
  name: "SerializerTest",
  cases: [
    {
      name: "SerializeOneLayer",
      execute: () => {
        // Prepare
        let user: User = {
          id: 12,
          isPaid: true,
          nickname: "jack",
          email: null,
          idHistory: [11, 20, null, 855],
          isPaidHistory: [true, undefined, false],
          nicknameHistory: ["queen", undefined, "king"],
        };

        // Execute
        let res = serializeMessage(user, USER);

        // Verify
        let expected = concatArrayBuffer([
          new Uint32Array([6]).buffer, // 6 fields
          new Uint32Array([1]).buffer, // index 1
          new Float64Array([12]).buffer, // value 12
          new Uint32Array([2]).buffer, // index 2
          new Uint8Array([1]).buffer, // value true
          new Uint32Array([3]).buffer, // index 3
          new Uint32Array([4]).buffer, // string byte length 4
          new Uint8Array([106, 97, 99, 107]).buffer, // UTF-8 encoding of "jack"
          new Uint32Array([5]).buffer, // index 5
          new Uint32Array([4]).buffer, // array length 4
          new Float64Array([11, 20, NaN, 855]).buffer, // array of numbers
          new Uint32Array([6]).buffer, // index 6
          new Uint32Array([3]).buffer, // array length 3
          new Uint8Array([1, 2, 0]).buffer, // array of booleans,
          new Uint32Array([8]).buffer, // index 8
          new Uint32Array([3]).buffer, // array length 3
          new Uint32Array([5]).buffer, // string byte length 5,
          new Uint8Array([113, 117, 101, 101, 110]).buffer, // UTF-8 encoding of "queen"
          new Uint32Array([4294967295]).buffer, // string byte length reserved for undefined
          new Uint32Array([4]).buffer, // string byte length 4
          new Uint8Array([107, 105, 110, 103]).buffer, // UTF-8 encoding of "king"
        ]);
        assertThat(res, eqUint8Array(expected), "serialized");
      },
    },
    {
      name: "SerializeTwoLayers",
      execute: () => {
        // Prepare
        let nestedUser: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            backgroundColor: Color.RED,
            preferredColor: 1,
            colorHistory: [Color.GREEN, undefined],
          },
          creditCards: [{ cardNumber: 1010 }, {}, null],
        };

        // Execute
        let res = serializeMessage(nestedUser, NESTED_USER);

        // Verify
        let expected = concatArrayBuffer([
          new Uint32Array([3]).buffer, // 3 fields of NestedUser
          new Uint32Array([1]).buffer, // index 1
          new Float64Array([25]).buffer, // value 25
          new Uint32Array([2]).buffer, // index 2
          new Uint32Array([4]).buffer, // 4 fields of UserInfo
          new Uint32Array([1]).buffer, // index 1
          new Uint32Array([7]).buffer, // string byte length
          new Uint8Array([115, 116, 117, 100, 101, 110, 116]).buffer, // UTF-8 encoding of "student"
          new Uint32Array([2]).buffer, // index 2
          new Uint32Array([10]).buffer, // Enum value 10
          new Uint32Array([3]).buffer, // index 3
          new Uint32Array([1]).buffer, // Enum value 1
          new Uint32Array([4]).buffer, // index 4
          new Uint32Array([2]).buffer, // array length 2
          new Uint32Array([2, 0]).buffer, // Enum value 2 and unknown value 0
          new Uint32Array([3]).buffer, // index 3
          new Uint32Array([3]).buffer, // array length 3 of creditCards
          new Uint32Array([1]).buffer, // 1 field of 1st card
          new Uint32Array([1]).buffer, // index 1
          new Float64Array([1010]).buffer, // value 1010
          new Uint32Array([0]).buffer, // 0 field of 2nd card
          new Uint32Array([4294967295]).buffer, // resereved num of field for undefined 3rd card
        ]);
        assertThat(res, eqUint8Array(expected), "serialized");
      },
    },
    {
      name: "SerializeTooLarge",
      execute: () => {
        // Prepare
        initBuffer(10);
        let user: User = {
          id: 25,
          isPaid: true,
          nickname: "jack",
        };

        // Execute
        let e = assertThrow(() => serializeMessage(user, USER));

        // Verify
        assertThat(e, eqError(new RangeError("Offset is outside")), "error");
      },
      tearDown: () => {
        initBuffer();
      },
    },
    {
      name: "DeserializeOneLayer",
      execute: () => {
        // Prepare
        let user: User = {
          id: 12,
          isPaid: true,
          nickname: "jack",
          email: undefined,
          idHistory: [11, 20, undefined, 855],
          isPaidHistory: [true, undefined, false],
          nicknameHistory: ["queen", undefined, "king"],
        };
        let binary = serializeMessage(user, USER);

        // Execute
        let res = deserializeMessage(binary, USER);

        // Verify
        assertThat(res, eqMessage(user, USER), "deserialized");
      },
    },
    {
      name: "DeserializeTwoLayers",
      execute: () => {
        // Prepare
        let nestedUser: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            backgroundColor: Color.RED,
            preferredColor: 1,
            colorHistory: [Color.GREEN, undefined],
          },
          creditCards: [{ cardNumber: 1010 }, {}, undefined],
        };
        let binary = serializeMessage(nestedUser, NESTED_USER);

        // Execute
        let res = deserializeMessage(binary, NESTED_USER);

        // Verify
        assertThat(res, eqMessage(nestedUser, NESTED_USER), "deserialized");
      },
    },
    {
      name: "DeserializeWithReusedBuffer",
      execute: () => {
        // Prepare
        let binary = concatArrayBuffer([
          new ArrayBuffer(10), // Padding
          new Uint32Array([2]).buffer, // 2 fields
          new Uint32Array([1]).buffer, // index 1
          new Float64Array([12]).buffer, // value 12
          new Uint32Array([3]).buffer, // index 3
          new Uint32Array([4]).buffer, // string byte length 4
          new Uint8Array([106, 97, 99, 107]).buffer, // UTF-8 encoding of "jack"
          new ArrayBuffer(10), // Padding
        ]);

        // Execute
        let res = deserializeMessage(binary.subarray(10, 38), USER);

        // Verify
        assertThat(
          res,
          eqMessage(
            {
              id: 12,
              nickname: "jack",
            },
            USER,
          ),
          "deserialized",
        );
      },
    },
    {
      name: "DeserializeExceedsBoundary",
      execute: () => {
        // Prepare
        let binary = concatArrayBuffer([
          new Uint32Array([2]).buffer, // 2 fields
          new Uint32Array([1]).buffer, // index 1
          new Float64Array([12]).buffer, // value 12
          new Uint32Array([3]).buffer, // index 3
          new Uint32Array([4]).buffer, // string byte length 4
          new Uint8Array([106, 97]).buffer, // UTF-8 encoding of "ja". 2 letters short.
        ]);

        // Execute
        let e = assertThrow(() => deserializeMessage(binary, USER));

        // Verify
        assertThat(
          e,
          eqError(new RangeError("Invalid typed array length")),
          "error",
        );
      },
    },
    {
      name: "DeserializeNull",
      execute: () => {
        // Prepare
        // Execute
        let res = deserializeMessage(null, USER);

        // Verify
        assertThat(res, eq(undefined), "deserialized");
      },
    },
  ],
});
