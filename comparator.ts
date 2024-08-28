import { MessageDescriptor, MessageField } from "./descriptor";

export function equalMessageField(
  leftValue: any,
  rightValue: any,
  fieldDescriptor: MessageField,
): boolean {
  if (fieldDescriptor.primitiveType || fieldDescriptor.enumType) {
    return leftValue === rightValue;
  } else {
    // message type
    return equalMessage(leftValue, rightValue, fieldDescriptor.messageType);
  }
}

export function equalMessage<T>(
  left: T,
  right: T,
  descriptor: MessageDescriptor<T>,
): boolean {
  if (right === undefined) {
    if (left !== undefined) {
      return false;
    } else {
      return true;
    }
  } else {
    if (left === undefined) {
      return false;
    }
  }

  let leftAny: any = left;
  let rightAny: any = right;
  for (let field of descriptor.fields) {
    if (leftAny[field.name] === undefined) {
      if (rightAny[field.name] !== undefined) {
        return false;
      } else {
         continue;
      }
    } else {
      if (rightAny[field.name] === undefined) {
        return false;
      }
    }
    if (!field.isArray) {
      if (
        !equalMessageField(leftAny[field.name], rightAny[field.name], field)
      ) {
        return false;
      }
    } else {
      let leftArray = leftAny[field.name];
      let rightArray = rightAny[field.name];
      if (leftArray.length !== rightArray.length) {
        return false;
      }
      for (let i = 0; i < leftArray.length; i++) {
        if (!equalMessageField(leftArray[i], rightArray[i], field)) {
          return false;
        }
      }
    }
  }
  return true;
}
