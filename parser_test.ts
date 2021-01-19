import { EnumDescriptor, MessageDescriptor, PrimitiveType } from "./descriptor";
import { parseEnum, parseMessage } from "./parser";
import { eqMessage } from "./test_matcher";
import { ObservableArray } from "@selfage/observable_array";
import { assertThat, eq } from "@selfage/test_base/matcher";
import { TEST_RUNNER } from "@selfage/test_base/runner";

let USER: MessageDescriptor<any> = {
  name: "User",
  factoryFn: () => {
    return new Object();
  },
  fields: [
    { name: "id", primitiveType: PrimitiveType.NUMBER },
    { name: "isPaid", primitiveType: PrimitiveType.BOOLEAN },
    { name: "nickname", primitiveType: PrimitiveType.STRING },
    { name: "email", primitiveType: PrimitiveType.STRING },
    {
      name: "idHistory",
      primitiveType: PrimitiveType.NUMBER,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
    {
      name: "isPaidHistory",
      primitiveType: PrimitiveType.BOOLEAN,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
    {
      name: "nicknameHistory",
      primitiveType: PrimitiveType.STRING,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
    {
      name: "emailHistory",
      primitiveType: PrimitiveType.STRING,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
  ],
};

let COLOR: EnumDescriptor<any> = {
  name: "Color",
  values: [
    { name: "RED", value: 10 },
    { name: "BLUE", value: 1 },
    { name: "GREEN", value: 2 },
  ],
};

let USER_INFO: MessageDescriptor<any> = {
  name: "UserInfo",
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: "intro",
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: "backgroundColor",
      enumDescriptor: COLOR,
    },
    {
      name: "preferredColor",
      enumDescriptor: COLOR,
    },
    {
      name: "colorHistory",
      enumDescriptor: COLOR,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
  ],
};

let CREDIT_CARD: MessageDescriptor<any> = {
  name: "CreditCard",
  factoryFn: () => {
    return new Object();
  },
  fields: [{ name: "cardNumber", primitiveType: PrimitiveType.NUMBER }],
};

let NESTED_USER: MessageDescriptor<any> = {
  name: "User",
  factoryFn: () => {
    return new Object();
  },
  fields: [
    { name: "id", primitiveType: PrimitiveType.NUMBER },
    {
      name: "userInfo",
      messageDescriptor: USER_INFO,
    },
    {
      name: "creditCards",
      messageDescriptor: CREDIT_CARD,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
  ],
};

function testParseEnum(input: string | number, expected: number) {
  // Prepare
  let colorEnumDescriptor: EnumDescriptor<any> = {
    name: "Color",
    values: [
      { name: "RED", value: 10 },
      { name: "BLUE", value: 1 },
      { name: "GREEN", value: 2 },
    ],
  };

  // Execute
  let parsed = parseEnum(input, colorEnumDescriptor);

  // Verify
  assertThat(parsed, eq(expected), "parsed");
}

TEST_RUNNER.run({
  name: "MessageUtilTest",
  cases: [
    {
      name: "ParseEnumValueFromNumber",
      execute: () => {
        testParseEnum(10, 10);
      },
    },
    {
      name: "ParseEnumValueFromExceededNumber",
      execute: () => {
        testParseEnum(12, undefined);
      },
    },
    {
      name: "ParseEnumValueFromString",
      execute: () => {
        testParseEnum("GREEN", 2);
      },
    },
    {
      name: "ParseEnumValueFromNonexistingString",
      execute: () => {
        testParseEnum("BLACK", undefined);
      },
    },
    {
      name: "ParseMessagePrimtivesAllPopulated",
      execute: () => {
        // Execute
        let parsed = parseMessage(
          {
            id: 12,
            isPaid: true,
            nickname: "jack",
            email: "test@gmail.com",
            idHistory: [11, 20, "20", {}, 855],
            isPaidHistory: [false, true, false, false],
            nicknameHistory: ["queen", "king", "ace"],
            emailHistory: ["test1@test.com", "123@ttt.com"],
          },
          USER
        );

        // Verify
        assertThat(
          parsed,
          eqMessage(
            {
              id: 12,
              isPaid: true,
              nickname: "jack",
              email: "test@gmail.com",
              idHistory: [11, 20, undefined, undefined, 855],
              isPaidHistory: [false, true, false, false],
              nicknameHistory: ["queen", "king", "ace"],
              emailHistory: ["test1@test.com", "123@ttt.com"],
            },
            USER
          ),
          "parsed"
        );
      },
    },
    {
      name: "ParseMessagePrimtivesOverride",
      execute: () => {
        // Prepare
        let emailHistory = new ObservableArray<string>();
        emailHistory.push(undefined, "test1@test.com", "123@ttt.com");
        let original: any = {
          id: 12,
          email: "0@grmail.com",
          idHistory: [11, undefined, 20],
          isPaidHistory: [false, true, false, false],
          emailHistory: emailHistory,
        };

        // Execute
        let parsed = parseMessage(
          {
            nickname: "jack",
            email: "test@gmail.com",
            idHistory: [11, 12],
            emailHistory: ["test1@test.com", "123@ttt.com"],
          },
          USER,
          original
        );

        // Verify
        assertThat(
          parsed,
          eqMessage(
            {
              nickname: "jack",
              email: "test@gmail.com",
              idHistory: [11, 12],
              emailHistory: ["test1@test.com", "123@ttt.com"],
            },
            USER
          ),
          "parsed"
        );
        assertThat(parsed, eq(original), "parsed reference");
        assertThat(
          parsed.idHistory,
          eq(original.idHistory),
          "idHistory reference"
        );
        assertThat(
          parsed.emailHistory,
          eq(original.emailHistory),
          "emailHistory reference"
        );
      },
    },
    {
      name: "ParseMessageNestedAllPopulated",
      execute: () => {
        // Execute
        let parsed = parseMessage(
          {
            id: 25,
            userInfo: {
              intro: "student",
              backgroundColor: "RED",
              preferredColor: 1,
              colorHistory: [true, "BLUE", "GREEN", 10],
            },
            creditCards: [
              { cardNumber: "1010" },
              2020,
              {},
              { cardNumber: 3030 },
            ],
          },
          NESTED_USER
        );

        // Verify
        assertThat(
          parsed,
          eqMessage(
            {
              id: 25,
              userInfo: {
                intro: "student",
                backgroundColor: 10,
                preferredColor: 1,
                colorHistory: [undefined, 1, 2, 10],
              },
              creditCards: ObservableArray.of(
                {},
                undefined,
                {},
                { cardNumber: 3030 }
              ),
            },
            NESTED_USER
          ),
          "parsed"
        );
      },
    },
    {
      name: "ParseMessageNestedOverride",
      execute: () => {
        // Prepare
        let original: any = {
          userInfo: {
            backgroundColor: "BLUE",
            colorHistory: ["BLUE"],
          },
          creditCards: ObservableArray.of(
            { cardNumber: 1010 },
            { cardNumber: 3030 }
          ),
        };

        // Execute
        let parsed = parseMessage(
          {
            userInfo: {
              backgroundColor: "RED",
              preferredColor: 1,
              colorHistory: ["BLUE", "GREEN"],
            },
            creditCards: [
              { cardNumber: 2020 },
              { cardNumber: 4040 },
              { cardNumber: 5050 },
            ],
          },
          NESTED_USER,
          original
        );

        // Verify
        assertThat(
          parsed,
          eqMessage(
            {
              userInfo: {
                backgroundColor: 10,
                preferredColor: 1,
                colorHistory: [1, 2],
              },
              creditCards: ObservableArray.of(
                { cardNumber: 2020 },
                { cardNumber: 4040 },
                { cardNumber: 5050 },
              ),
            },
            NESTED_USER
          ),
          "parsed"
        );
        assertThat(parsed, eq(original), "parsed reference");
        assertThat(
          parsed.userInfo,
          eq(original.userInfo),
          "parsed.userInfo reference"
        );
        assertThat(
          parsed.userInfo.colorHistory,
          eq(original.userInfo.colorHistory),
          "parsed.userInfo.colorHistory reference"
        );
        assertThat(
          parsed.creditCards,
          eq(original.creditCards),
          "parsed.creditCards reference"
        );
        assertThat(
          parsed.creditCards.get(0),
          eq(original.creditCards.get(0)),
          "parsed.creditCards.get(0) reference"
        );
        assertThat(
          parsed.creditCards.get(1),
          eq(original.creditCards.get(1)),
          "parsed.creditCards.get(0) reference"
        );
      },
    },
  ],
});
