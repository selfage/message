import {
  EnumDescriptor,
  EnumValue,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./descriptor";

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
  return enumValueFound ? enumValueFound.value : undefined;
}

export function parseField(sourceField: any, field: MessageField): any {
  if (field.primitiveType) {
    switch (field.primitiveType) {
      case PrimitiveType.NUMBER:
        if (typeof sourceField === "number") {
          return sourceField;
        } else {
          return undefined;
        }
      case PrimitiveType.BOOLEAN:
        if (typeof sourceField === "boolean") {
          return sourceField;
        } else {
          return undefined;
        }
      case PrimitiveType.STRING:
        if (typeof sourceField === "string") {
          return sourceField;
        } else {
          return undefined;
        }
      default:
        return undefined;
    }
  } else if (field.enumType) {
    return parseEnum(sourceField, field.enumType);
  } else {
    // message type
    return parseMessage(sourceField, field.messageType);
  }
}

export function parseMessage<T>(raw: any, descriptor: MessageDescriptor<T>): T {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  let ret: any = {};
  for (let field of descriptor.fields) {
    if (raw[field.name] === undefined) {
      continue;
    }
    if (!field.isArray) {
      ret[field.name] = parseField(raw[field.name], field);
    } else if (Array.isArray(raw[field.name])) {
      let retArrayField: any = [];
      ret[field.name] = retArrayField;
      let sourceArrayField = raw[field.name];
      for (let element of sourceArrayField) {
        retArrayField.push(parseField(element, field));
      }
    }
  }
  return ret;
}
