import { MessageDescriptor, MessageField } from "./descriptor";

export function copyMessage<T>(
  fromMessage: T,
  descriptor: MessageDescriptor<T>,
  toMessage?: T
): T {
  if (!fromMessage) {
    return undefined;
  }

  let source: any = fromMessage;
  let ret: any = toMessage;
  if (!ret) {
    ret = {};
  }
  for (let field of descriptor.fields) {
    if (!field.isArray) {
      ret[field.name] = copyField(source[field.name], field, ret[field.name]);
    } else if (!source[field.name]) {
      ret[field.name] = undefined;
    } else {
      if (!ret[field.name]) {
        ret[field.name] = [];
      }
      let sourceArrayField = source[field.name];
      let retArrayField = ret[field.name];
      let i = 0;
      for (let element of sourceArrayField) {
        if (i < retArrayField.length) {
          retArrayField[i] = copyField(element, field, retArrayField[i]);
        } else {
          retArrayField.push(copyField(element, field));
        }
        i++;
      }
      for (let i = retArrayField.length; i > sourceArrayField.length; i--) {
        retArrayField.pop();
      }
    }
  }
  return ret;
}

function copyField(
  sourceField: any,
  field: MessageField,
  outputField?: any
): any {
  if (field.primitiveType || field.enumType) {
    return sourceField;
  } else if (field.messageType) {
    return copyMessage(sourceField, field.messageType, outputField);
  }
}
