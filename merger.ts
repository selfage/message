import { MessageDescriptor, MessageField } from "./descriptor";

export function mergeMessage<T>(
  fromMessage: T,
  descriptor: MessageDescriptor<T>,
  toMessage?: T
): T {
  if (!fromMessage) {
    return toMessage;
  }

  let source: any = fromMessage;
  let ret: any = toMessage;
  if (!ret) {
    ret = {};
  }
  for (let field of descriptor.fields) {
    if (!field.isArray) {
      ret[field.name] = mergeField(source[field.name], field, ret[field.name]);
    } else if (source[field.name]) {
      if (!ret[field.name]) {
        ret[field.name] = [];
      }
      let sourceArrayField = source[field.name];
      let retArrayField = ret[field.name];
      let i = 0;
      for (let element of sourceArrayField) {
        if (i < retArrayField.length) {
          retArrayField[i] = mergeField(element, field, retArrayField[i]);
        } else {
          retArrayField.push(mergeField(element, field));
        }
        i++;
      }
    }
  }
  return ret;
}

export function mergeField(
  sourceField: any,
  field: MessageField,
  outputField?: any
): any {
  if (field.primitiveType || field.enumType) {
    if (sourceField !== undefined) {
      return sourceField;
    } else {
      return outputField;
    }
  } else if (field.messageType) {
    return mergeMessage(sourceField, field.messageType, outputField);
  }
}
