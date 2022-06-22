import { MessageDescriptor, MessageField } from "./descriptor";
import {
  MatchFn,
  assertThat,
  eq,
  eqArray,
  assert,
} from "@selfage/test_matcher";

export function eqMessage<T>(
  expected: T | undefined,
  descriptor: MessageDescriptor<T>
): MatchFn<T> {
  return (actual) => {
    if (expected === undefined) {
      assertThat(actual, eq(undefined), "nullity");
      return;
    }
    assert(Boolean(actual), `to not be null`, `null`);
    let expectedAny = expected as any;
    let actualAny = actual as any;
    for (let fieldDescriptor of descriptor.fields) {
      let fieldMatcher: MatchFn<any>;
      if (!fieldDescriptor.isArray) {
        fieldMatcher = eqMessageField(
          expectedAny[fieldDescriptor.name],
          fieldDescriptor
        );
      } else {
        let eqElements: Array<MatchFn<any>>;
        if (expectedAny[fieldDescriptor.name] !== undefined) {
          eqElements = new Array<MatchFn<any>>();
          for (let element of expectedAny[fieldDescriptor.name]) {
            eqElements.push(eqMessageField(element, fieldDescriptor));
          }
        }
        fieldMatcher = eqArray(eqElements);
      }
      assertThat(
        actualAny[fieldDescriptor.name],
        fieldMatcher,
        `${fieldDescriptor.name} field`
      );
    }
  };
}

export function eqMessageField(
  expectedField: any,
  fieldDescriptor: MessageField
): MatchFn<any> {
  if (fieldDescriptor.primitiveType || fieldDescriptor.enumType) {
    return eq(expectedField);
  } else {
    return eqMessage(expectedField, fieldDescriptor.messageType);
  }
}
