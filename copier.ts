import { MessageDescriptor, MessageField } from "./descriptor";

export function copyField(from: any, field: MessageField, output?: any): any {
  if (field.primitiveType) {
    return from;
  } else if (field.enumType) {
    return from;
  } else {
    // message type
    return copyMessageType(from, field.messageType, output);
  }
}

export function copyMessageType<T>(
  from: any,
  descriptor: MessageDescriptor<T>,
  output?: T,
): T {
  if (!from) {
    return undefined;
  }

  let ret: any = output;
  if (!ret) {
    ret = {};
  }
  for (let field of descriptor.fields) {
    if (from[field.name] === undefined) {
      ret[field.name] = undefined;
      continue;
    }

    if (!field.isArray) {
      ret[field.name] = copyField(from[field.name], field, ret[field.name]);
    } else {
      if (!ret[field.name]) {
        ret[field.name] = [];
      }
      let fromArrayField = from[field.name];
      let retArrayField = ret[field.name];
      for (let i = 0; i < fromArrayField.length; i++) {
        if (i < retArrayField.length) {
          retArrayField[i] = copyField(
            fromArrayField[i],
            field,
            retArrayField[i],
          );
        } else {
          retArrayField.push(copyField(fromArrayField[i], field));
        }
      }
      while (retArrayField.length > fromArrayField.length) {
        retArrayField.pop();
      }
    }
  }
  return ret;
}

export function copyMessage<T>(
  from: T,
  descriptor: MessageDescriptor<T>,
  to?: T,
): T {
  return copyMessageType(from, descriptor, to);
}
