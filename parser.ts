import {
  EnumDescriptor,
  EnumValue,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./descriptor";

export function parseEnum<T>(raw: any, descriptor: EnumDescriptor<T>): any {
  let enumValueFound: EnumValue;
  if (typeof raw === "string") {
    enumValueFound = descriptor.values.find((enumValue): boolean => {
      return enumValue.name === raw;
    });
  } else if (typeof raw === "number") {
    enumValueFound = descriptor.values.find((enumValue): boolean => {
      return enumValue.value === raw;
    });
  }
  if (enumValueFound === undefined) {
    return undefined;
  } else {
    return enumValueFound.value;
  }
}

export function parseMessage<T>(
  raw: any,
  descriptor: MessageDescriptor<T>,
  outputMessage?: T
): T {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  let ret: any = outputMessage;
  if (!ret) {
    ret = {};
  }
  for (let field of descriptor.fields) {
    if (!field.isArray) {
      ret[field.name] = parseField(raw[field.name], field, ret[field.name]);
    } else if (!Array.isArray(raw[field.name])) {
      ret[field.name] = undefined;
    } else {
      if (!Array.isArray(ret[field.name])) {
        ret[field.name] = [];
      }
      let rawArrayField = raw[field.name];
      let retArrayField = ret[field.name];
      let i = 0;
      for (let element of rawArrayField) {
        if (i < retArrayField.length) {
          retArrayField[i] = parseField(element, field, retArrayField[i]);
        } else {
          retArrayField.push(parseField(element, field));
        }
        i++;
      }
      for (let i = retArrayField.length; i > rawArrayField.length; i--) {
        retArrayField.pop();
      }
    }
  }
  return ret;
}

export function parseField(
  rawField: any,
  field: MessageField,
  outputField?: any
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
    return parseMessage(rawField, field.messageType, outputField);
  }
}
