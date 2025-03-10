import { destringifyMessage, stringifyMessage } from "./stringifier";
import { Color, NESTED_USER, NestedUser, USER, User } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "StringifierTest",
  cases: [
    {
      name: "StringifyOneLayer",
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

        // Execute
        let res = stringifyMessage(user, USER);

        // Verify
        assertThat(
          res,
          eq(
            `{"1":12,"2":true,"3":"jack","5":[11,20,null,855],"6":[true,null,false],"8":["queen",null,"king"]}`,
          ),
          "res",
        );
      },
    },
    {
      name: "StringifyTwoLayers",
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

        // Execute
        let res = stringifyMessage(nestedUser, NESTED_USER);

        // Verify
        assertThat(
          res,
          eq(
            `{"1":25,"2":{"1":"student","2":10,"3":1,"4":[2,null]},"3":[{"1":1010},{},null]}`,
          ),
          "res",
        );
      },
    },
    {
      name: "DestringifyOneLayer",
      execute: () => {
        // Prepare
        let raw = `{"1":12,"2":true,"4":"test@gmail.com","5":[11,20,"20",{},855],"6":[true,null,false],"7":1111,"8":["queen",null,"king"]}`;

        // Execute
        let res = destringifyMessage(raw, USER);

        // Verify
        assertThat(
          res,
          eqMessage(
            {
              id: 12,
              isPaid: true,
              email: "test@gmail.com",
              idHistory: [11, 20, undefined, undefined, 855],
              isPaidHistory: [true, undefined, false],
              nicknameHistory: ["queen", undefined, "king"],
            },
            USER,
          ),
          "res",
        );
      },
    },
    {
      name: "DestringifyTwoLayers",
      execute: () => {
        // Prepare
        let raw = `{"1":25,"2":{"1":"student","2":10,"3":1,"4":[true,"BLUE",2]},"3":[{"1":"1010"},2020,{},{"1":3030},null]}`;

        // Execute
        let res = destringifyMessage(raw, NESTED_USER);

        // Verify
        assertThat(
          res,
          eqMessage(
            {
              id: 25,
              userInfo: {
                intro: "student",
                backgroundColor: 10,
                preferredColor: 1,
                colorHistory: [undefined, undefined, Color.GREEN],
              },
              creditCards: [{}, undefined, {}, { cardNumber: 3030 }, undefined],
            },
            NESTED_USER,
          ),
          "res",
        );
      },
    },
    {
      name: "StringifyAndThenDeStringify",
      execute: () => {
        // Prepare
        let nestedUser: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            backgroundColor: Color.RED,
            preferredColor: 1,
            colorHistory: [Color.BLUE, undefined],
          },
          creditCards: [{ cardNumber: 1010 }, {}, undefined],
        };

        // Execute
        let res = destringifyMessage(
          stringifyMessage(nestedUser, NESTED_USER),
          NESTED_USER,
        );

        // Verify
        assertThat(res, eqMessage(nestedUser, NESTED_USER), "res");
      },
    },
    {
      name: "DestringyNull",
      execute: () => {
        // Execute
        let res = destringifyMessage(null, USER);

        // Verify
        assertThat(res, eq(undefined), "res");
      },
    },
  ],
});
