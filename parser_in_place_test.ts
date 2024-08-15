import { parseMessageInPlace } from "./parser_in_place";
import { NESTED_USER, USER } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "ParserTest",
  cases: [
    {
      name: "ParseMessagePrimtivesAllPopulated",
      execute: () => {
        // Execute
        let parsed = parseMessageInPlace(
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
      name: "ParseMessageNestedAllPopulated",
      execute: () => {
        // Execute
        let parsed = parseMessageInPlace(
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
  ],
});
