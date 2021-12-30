import { EnumDescriptor } from "./descriptor";
import { parseEnum, parseMessage } from "./parser";
import { HistoryState, HomeState, STATE, State } from "./test_data/state";
import { NESTED_USER, USER } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { ObservableArray } from "@selfage/observable_array";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

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

NODE_TEST_RUNNER.run({
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
        let original: any = {
          id: 12,
          email: "0@grmail.com",
          idHistory: [11, undefined, 20],
          isPaidHistory: [false, true, false, false],
          nicknameHistory: ["queen", "king", "ace"],
        };

        // Execute
        let parsed = parseMessage(
          {
            nickname: "jack",
            email: "test@gmail.com",
            idHistory: [11, 12],
            isPaidHistory: [false, true, "false", true, 12],
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
              isPaidHistory: [false, true, undefined, true, undefined],
            },
            USER
          ),
          "parsed"
        );
        assertThat(parsed, eq(original), "parsed reference");
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
              creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
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
          creditCards: [{ cardNumber: 1010 }, { cardNumber: 3030 }],
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
              creditCards: [
                { cardNumber: 2020 },
                { cardNumber: 4040 },
                { cardNumber: 5050 },
              ],
            },
            NESTED_USER
          ),
          "parsed"
        );
        assertThat(parsed, eq(original), "parsed reference");
      },
    },
    {
      name: "ParseObservableAllPopulated",
      execute: () => {
        // Execute
        let parsed = parseMessage(
          {
            showHome: true,
            homeState: {
              videoId: "id1",
            },
            historyState: {
              videoIds: ["id2", "id3", "id4"],
            },
          },
          STATE
        );

        // Verify
        let expectedState = new State();
        expectedState.showHome = true;
        expectedState.homeState = new HomeState();
        expectedState.homeState.videoId = "id1";
        expectedState.historyState = new HistoryState();
        expectedState.historyState.videoIds = ObservableArray.of(
          "id2",
          "id3",
          "id4"
        );
        assertThat(parsed, eqMessage(expectedState, STATE), "parsed state");
      },
    },
    {
      name: "ParseObservableOverrides",
      execute: () => {
        // Prepare
        let original = new State();
        original.showHome = true;
        original.homeState = new HomeState();
        original.homeState.videoId = "id1";
        original.historyState = new HistoryState();
        original.historyState.videoIds = ObservableArray.of(
          "id2",
          "id3",
          "id4"
        );

        // Execute
        let parsed = parseMessage(
          {
            showHome: true,
            historyState: {
              videoIds: ["id5", 123],
            },
          },
          STATE,
          original
        );

        // Verify
        let expectedState = new State();
        expectedState.showHome = true;
        expectedState.historyState = new HistoryState();
        expectedState.historyState.videoIds = ObservableArray.of(
          "id5",
          undefined
        );
        assertThat(parsed, eqMessage(expectedState, STATE), "parsed state");
        assertThat(parsed, eq(original), "parsed reference");
      },
    },
    {
      name: "ParseObservableFromObservable",
      execute: () => {
        // Prepare
        let state = new State();
        state.showHome = true;
        state.homeState = new HomeState();
        state.homeState.videoId = "id1";
        state.historyState = new HistoryState();
        state.historyState.videoIds = ObservableArray.of("id2", "id3", "id4");

        // Execute
        let parsed = parseMessage(state, STATE);

        // Verify
        assertThat(parsed, eqMessage(state, STATE), "parsed state");
      },
    },
  ],
});
