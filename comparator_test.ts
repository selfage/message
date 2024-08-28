import { equalMessage } from "./comparator";
import { Color, NESTED_USER, NestedUser } from "./test_data/user";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "ComparatorTest",
  cases: [
    {
      name: "Equal",
      execute: () => {
        // Prepare
        let left: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
            preferredColor: Color.BLUE,
            colorHistory: [undefined, 1, 2, 10],
          },
          creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
        };
        let right = left;

        // Execute
        let res = equalMessage(left, right, NESTED_USER);

        // Verify
        assertThat(res, eq(true), "equal");
      },
    },
    {
      name: "NumberNotEqual",
      execute: () => {
        // Prepare
        let left: NestedUser = {
          id: 12,
        };
        let right: NestedUser = {
          id: 25,
        };

        // Execute
        let res = equalMessage(left, right, NESTED_USER);

        // Verify
        assertThat(res, eq(false), "not equal");
      },
    },
    {
      name: "StringNotEqual",
      execute: () => {
        // Prepare
        let left: NestedUser = {
          id: 25,
          userInfo: {
            intro: "ssss",
          },
        };
        let right: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
          },
        };

        // Execute
        let res = equalMessage(left, right, NESTED_USER);

        // Verify
        assertThat(res, eq(false), "not equal");
      },
    },
    {
      name: "ArrayNotEqual",
      execute: () => {
        // Prepare
        let left: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
            colorHistory: [1, 2, 10],
          },
        };
        let right: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
            colorHistory: [undefined, 1, 2, 10],
          },
        };

        // Execute
        let res = equalMessage(left, right, NESTED_USER);

        // Verify
        assertThat(res, eq(false), "not equal");
      },
    },
    {
      name: "ArrayElementNotEqual",
      execute: () => {
        // Prepare
        let left: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
            colorHistory: [undefined, 1, 2, 10],
          },
          creditCards: [{}, {}, {}, { cardNumber: 3030 }],
        };
        let right: NestedUser = {
          id: 25,
          userInfo: {
            intro: "sss",
            colorHistory: [undefined, 1, 2, 10],
          },
          creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
        };

        // Execute
        let res = equalMessage(left, right, NESTED_USER);

        // Verify
        assertThat(res, eq(false), "not equal");
      },
    },
  ],
});
