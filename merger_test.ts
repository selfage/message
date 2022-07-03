import { mergeMessage } from "./merger";
import { NESTED_USER, NestedUser } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "MergerTest",
  cases: [
    {
      name: "MergeNestedMessageNested",
      execute: () => {
        // Prepare
        let existing: NestedUser = {
          id: 25,
          userInfo: {
            intro: "teacher",
            backgroundColor: 10,
            colorHistory: [11, 1, 3, 10, 12],
          },
          creditCards: [{ cardNumber: 1010 }],
        };
        let source: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            preferredColor: 1,
            colorHistory: [undefined, 1, 2],
          },
          creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
        };

        // Execute
        let ret = mergeMessage(source, NESTED_USER, existing);

        // Verify
        assertThat(
          existing,
          eqMessage(
            {
              id: 25,
              userInfo: {
                intro: "student",
                backgroundColor: 10,
                preferredColor: 1,
                colorHistory: [11, 1, 2, 10, 12],
              },
              creditCards: [
                { cardNumber: 1010 },
                undefined,
                {},
                { cardNumber: 3030 },
              ],
            },
            NESTED_USER
          ),
          "merged"
        );
        assertThat(ret, eq(existing), "merged reference");
      },
    },
  ],
});
