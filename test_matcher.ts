import { MessageDescriptor } from "./descriptor";
import { eqObservableArray } from "@selfage/observable_array/test_matcher";
import { MatchFn, assertThat, eq, eqArray } from "@selfage/test_matcher";

export function eqMessage<T>(
  expected: T | undefined,
  descriptor: MessageDescriptor<T>
): MatchFn<T> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    let expectedAny = expected as any;
    let actualAny = actual as any;
    for (let field of descriptor.fields) {
      let fieldMatcher: MatchFn<any>;
      if (field.primitiveType || field.enumDescriptor) {
        if (field.arrayFactoryFn || field.observableArrayFactoryFn) {
          let eqElements: Array<MatchFn<any>>;
          if (expectedAny[field.name] !== undefined) {
            eqElements = new Array<MatchFn<any>>();
            for (let element of expectedAny[field.name]) {
              eqElements.push(eq(element));
            }
          }
          if (field.arrayFactoryFn) {
            fieldMatcher = eqArray(eqElements);
          } else {
            fieldMatcher = eqObservableArray(eqElements);
          }
        } else {
          fieldMatcher = eq(expectedAny[field.name]);
        }
      } else if (field.messageDescriptor) {
        if (field.arrayFactoryFn || field.observableArrayFactoryFn) {
          let eqElements: Array<MatchFn<any>>;
          if (expectedAny[field.name] !== undefined) {
            eqElements = new Array<MatchFn<any>>();
            for (let element of expectedAny[field.name]) {
              eqElements.push(eqMessage(element, field.messageDescriptor));
            }
          }
          if (field.arrayFactoryFn) {
            fieldMatcher = eqArray(eqElements);
          } else {
            fieldMatcher = eqObservableArray(eqElements);
          }
        } else {
          fieldMatcher = eqMessage(
            expectedAny[field.name],
            field.messageDescriptor
          );
        }
      } else {
        throw new Error(
          `Field type of ${field.name} is not supported. Field definition ` +
            `is ${JSON.stringify(field)}`
        );
      }
      assertThat(actualAny[field.name], fieldMatcher, `${field.name} field`);
    }
  };
}
