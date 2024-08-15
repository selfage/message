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
  if (enumValueFound === undefined) {
    return undefined;
  } else {
    return enumValueFound.value;
  }
}

export function parseField(
  rawField: any,
  field: MessageField,
): any {
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
    return parseMessageInPlace(rawField, field.messageType);
  }
}

export function parseMessageInPlace<T>(
  raw: any,
  descriptor: MessageDescriptor<T>
): T {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  for (let field of descriptor.fields) {
    if (!field.isArray) {
      raw[field.name] = parseField(raw[field.name], field);
    } else if (!Array.isArray(raw[field.name])) {
      raw[field.name] = undefined;
    } else {
      // field.isArray AND raw[field.name] is array
      let rawArrayField = raw[field.name];
      for (let i = 0; i < rawArrayField.length; i++) {
        rawArrayField[i] = parseField(rawArrayField[i], field);
      }
    }
  }
  return raw;
}
