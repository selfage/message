import { copyMessage } from "./copier";
import { NESTED_USER, NestedUser } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "CopierTest",
  cases: [
    {
      name: "CopyMessageNested",
      execute: () => {
        // Prepare
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
        let ret = copyMessage(source, NESTED_USER);

        // Verify
        assertThat(ret, eqMessage(source, NESTED_USER), "copied");
      },
    },
    {
      name: "CopyMessageNestedInPlaceOverrides",
      execute: () => {
        // Prepare
        let source: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            backgroundColor: 10,
            preferredColor: 1,
          },
          creditCards: [{ cardNumber: 3030 }, { cardNumber: 1212 }],
        };
        let dest: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
            preferredColor: 20,
            colorHistory: [undefined, 1, 2, 10],
          },
          creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
        };

        // Execute
        let ret = copyMessage(source, NESTED_USER, dest);

        // Verify
        assertThat(dest, eqMessage(source, NESTED_USER), "copied");
        assertThat(ret, eq(dest), "copied reference");
      },
    },
  ],
});
