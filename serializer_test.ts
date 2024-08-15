import { deserializeMessage, serializeMessage } from "./serializer";
import { Color, NESTED_USER, NestedUser, USER, User } from "./test_data/user";
import { eqMessage } from "./test_matcher";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";
import { BSON } from "bson";

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
          email: undefined,
          idHistory: [11, 20, undefined, 855],
          isPaidHistory: [false, true, false],
          nicknameHistory: ["queen", "king"],
        };

        // Execute
        let res = serializeMessage(user, USER);

        // Verify
        assertThat(
          JSON.stringify(BSON.deserialize(res)),
          eq(
            `{"a":[[1,12],[2,true],[3,"jack"],[5,11],[5,20],[5,null],[5,855],[6,false],[6,true],[6,false],[8,"queen"],[8,"king"]]}`,
          ),
          "res",
        );
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
            colorHistory: [Color.BLUE, Color.GREEN],
          },
          creditCards: [{ cardNumber: 1010 }, {}, { cardNumber: 3030 }],
        };

        // Execute
        let res = serializeMessage(nestedUser, NESTED_USER);

        // Verify
        assertThat(
          JSON.stringify(BSON.deserialize(res)),
          eq(
            `{"a":[[1,25],[2,[[1,"student"],[2,10],[3,1],[4,1],[4,2]]],[3,[[1,1010]]],[3,[]],[3,[[1,3030]]]]}`,
          ),
          "res",
        );
      },
    },
    {
      name: "DeserializeOneLayer",
      execute: () => {
        // Prepare
        let raw = BSON.serialize({
          a: [
            [1, 12],
            [2, true],
            // Skips index 3
            [4, "test@gmail.com"],
            [5, 11],
            [5, 20],
            [5, "20"],
            [5, {}],
            [5, 855],
            [6, false],
            [6, true],
            [6, false],
            [6, false],
            [7, 111111], // Not exists
            [8, "queen"],
            [8, "king"],
            [8, "ace"],
          ],
        });

        // Execute
        let res = deserializeMessage(raw, USER);

        // Verify
        assertThat(
          res,
          eqMessage(
            {
              id: 12,
              isPaid: true,
              email: "test@gmail.com",
              idHistory: [11, 20, undefined, undefined, 855],
              isPaidHistory: [false, true, false, false],
              nicknameHistory: ["queen", "king", "ace"],
            },
            USER,
          ),
          "res",
        );
      },
    },
    {
      name: "DeserializeTwoLayers",
      execute: () => {
        // Prepare
        let raw = BSON.serialize({
          a: [
            [1, 25],
            [
              2,
              [
                [1, "student"],
                [2, "RED"],
                [3, 1],
                [4, true],
                [4, "BLUE"],
                [4, "GREEN"],
                [4, 10],
              ],
            ],
            [3, [[1, "1010"]]],
            [3, 2020],
            [3, []],
            [3, [[1, 3030]]],
          ],
        });

        // Execute
        let res = deserializeMessage(raw, NESTED_USER);

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
                colorHistory: [undefined, 1, 2, 10],
              },
              creditCards: [{}, undefined, {}, { cardNumber: 3030 }],
            },
            NESTED_USER,
          ),
          "res",
        );
      },
    },
    {
      name: "SerializeAndThenDeserialize",
      execute: () => {
        // Prepare
        let nestedUser: NestedUser = {
          id: 25,
          userInfo: {
            intro: "student",
            backgroundColor: Color.RED,
            preferredColor: 1,
            colorHistory: [Color.BLUE, Color.GREEN],
          },
          creditCards: [{ cardNumber: 1010 }, {}, { cardNumber: 3030 }],
        };

        // Execute
        let res = deserializeMessage(
          serializeMessage(nestedUser, NESTED_USER),
          NESTED_USER,
        );

        // Verify
        assertThat(res, eqMessage(nestedUser, NESTED_USER), "res");
      },
    },
  ],
});
