import {
  EnumDescriptor,
  EnumValue,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./descriptor";

export function toIndexed(
  message: any,
  descriptor: MessageDescriptor<any>,
): Array<any> {
  let indexedMessage: any = {};
  for (let field of descriptor.fields) {
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
      if (message[field.name] === undefined) {
        continue;
      }
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

export function parseEnum(source: any, descriptor: EnumDescriptor<any>): any {
  let enumValueFound: EnumValue;
  if (typeof source === "string") {
    enumValueFound = descriptor.values.find((enumValue): boolean => {
      return enumValue.name === source;
    });
  } else if (typeof source === "number") {
    enumValueFound = descriptor.values.find((enumValue): boolean => {
      return enumValue.value === source;
    });
  }
  if (enumValueFound === undefined) {
    return undefined;
  } else {
    return enumValueFound.value;
  }
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
    return parseEnum(rawField, field.enumType);
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
  raw: string,
  descriptor: MessageDescriptor<T>,
): T {
  return fromIndexed(JSON.parse(raw), descriptor);
}
