import { mergeMessage } from "./merger";
import { NESTED_USER, NestedUser, USER, User } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "MergerTest",
  cases: [
    {
      name: "MergeMessage",
      execute: () => {
        // Prepare
        let existing: User = {
          id: 15,
          isPaid: true,
          email: "test@gmail.com",
          idHistory: [22, 30, 33],
          isPaidHistory: [true, false, undefined],
          nicknameHistory: ["queen", "pawn", "ace", "hahha"],
        };
        let source: User = {
          id: 12,
          isPaid: false,
          nickname: "jack",
          idHistory: [11, 20, undefined, undefined, 855],
          nicknameHistory: ["queen", "king", "ace"],
        };

        // Execute
        let ret = mergeMessage(source, USER, existing);

        // Verify
        assertThat(
          existing,
          eqMessage(
            {
              id: 12,
              isPaid: false,
              nickname: "jack",
              email: "test@gmail.com",
              idHistory: [11, 20, 33, undefined, 855],
              isPaidHistory: [true, false, undefined],
              nicknameHistory: ["queen", "king", "ace", "hahha"],
            },
            USER
          ),
          "merged"
        );
        assertThat(ret, eq(existing), "merged reference");
      },
    },
    {
      name: "MergeMessageFromEmpty",
      execute: () => {
        // Prepare
        let existing: User = {
          id: 15,
          isPaid: true,
          email: "test@gmail.com",
        };
        let source: NestedUser = {};

        // Execute
        let ret = mergeMessage(source, USER, existing);

        // Verify
        assertThat(
          existing,
          eqMessage(
            {
              id: 15,
              isPaid: true,
              email: "test@gmail.com",
            },
            USER
          ),
          "merged"
        );
        assertThat(ret, eq(existing), "merged reference");
      },
    },
    {
      name: "MergeMessageNestedWithEmpty",
      execute: () => {
        // Prepare
        let existing: NestedUser = {};
        let source: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            backgroundColor: 10,
            preferredColor: 1,
            colorHistory: [undefined, 1, 2, 10],
          },
          creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
        };

        // Execute
        let ret = mergeMessage(source, NESTED_USER, existing);

        // Verify
        assertThat(existing, eqMessage(source, NESTED_USER), "merged");
        assertThat(ret, eq(existing), "merged reference");
      },
    },
  ],
});
