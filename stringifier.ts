import { MessageDescriptor, MessageField, PrimitiveType } from "./descriptor";

export function toIndexed(
  message: any,
  descriptor: MessageDescriptor<any>,
): any {
  if (!message) {
    return undefined;
  }

  let indexedMessage: any = {};
  for (let field of descriptor.fields) {
    if (message[field.name] === undefined) {
      continue;
    }
    if (field.isArray) {
      let array: Array<any> = [];
      indexedMessage[field.index] = array;
      for (let value of message[field.name]) {
        if (field.messageType) {
          array.push(toIndexed(value, field.messageType));
        } else {
          array.push(value);
        }
      }
    } else {
      if (field.messageType) {
        indexedMessage[field.index] = toIndexed(
          message[field.name],
          field.messageType,
        );
      } else {
        indexedMessage[field.index] = message[field.name];
      }
    }
  }
  return indexedMessage;
}

export function stringifyMessage<T>(
  message: T,
  descriptor: MessageDescriptor<T>,
): string {
  return JSON.stringify(toIndexed(message, descriptor));
}

export function parseField(rawField: any, field: MessageField): any {
  if (field.primitiveType) {
    if (field.primitiveType === PrimitiveType.NUMBER) {
      if (typeof rawField === "number") {
        return rawField;
      } else {
        return undefined;
      }
    } else if (field.primitiveType === PrimitiveType.BOOLEAN) {
      if (typeof rawField === "boolean") {
        return rawField;
      } else {
        return undefined;
      }
    } else if (field.primitiveType === PrimitiveType.STRING) {
      if (typeof rawField === "string") {
        return rawField;
      } else {
        return undefined;
      }
    }
  } else if (field.enumType) {
    if (typeof rawField === "number") {
      let enumValueFound = field.enumType.values.find((enumValue): boolean => {
        return enumValue.value === rawField;
      });
      return enumValueFound ? enumValueFound.value : undefined;
    } else {
      return undefined;
    }
  } else if (field.messageType) {
    return fromIndexed(rawField, field.messageType);
  }
}

export function fromIndexed(
  indexedMessage: Array<any>,
  descriptor: MessageDescriptor<any>,
): any {
  if (!indexedMessage || typeof indexedMessage !== "object") {
    return undefined;
  }

  let ret: any = {};
  for (let field of descriptor.fields) {
    if (!field.isArray) {
      ret[field.name] = parseField(indexedMessage[field.index], field);
    } else if (!Array.isArray(indexedMessage[field.index])) {
      ret[field.name] = undefined;
    } else {
      // field.isArray AND raw[field.name] is array
      let rawArrayField = indexedMessage[field.index];
      let retArrayField: Array<any> = [];
      ret[field.name] = retArrayField;
      for (let i = 0; i < rawArrayField.length; i++) {
        retArrayField.push(parseField(rawArrayField[i], field));
      }
    }
  }
  return ret;
}

export function destringifyMessage<T>(
  raw: string | undefined | null,
  descriptor: MessageDescriptor<T>,
): T {
  if (!raw) {
    return undefined;
  }
  return fromIndexed(JSON.parse(raw), descriptor);
}
