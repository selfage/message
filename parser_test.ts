import { parseMessage } from "./parser";
import { NESTED_USER, USER } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "ParserTest",
  cases: [
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
            preferredColor: 1,
            colorHistory: ["BLUE"],
          },
          creditCards: [{ cardNumber: 1010 }, { cardNumber: 3030 }],
        };

        // Execute
        let parsed = parseMessage(
          {
            userInfo: {
              backgroundColor: "RED",
              preferredColor: 12,
              colorHistory: ["BLUE", "BLACK", "GREEN"],
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
                preferredColor: undefined,
                colorHistory: [1, undefined, 2],
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
  ],
});
