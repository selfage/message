import { MessageAssembler } from "./assembler";
import {
  EnumDescriptor,
  EnumValue,
  MessageDescriptor,
  PrimitiveType,
} from "./descriptor";

export function checkSourceNonNull(source: any): boolean {
  return Boolean(source) && typeof source === "object";
}

export function nullifyOutput(): any {
  return undefined;
}

export function checkArrayType(sourceField: any): boolean {
  return Array.isArray(sourceField);
}

export function nullifyArray(ret: any, fieldName: string): void {
  ret[fieldName] = undefined;
}

export function popArrayUntilTargetLength(
  retArrayField: any,
  targetLength: number
): void {
  for (let i = retArrayField.length; i > targetLength; i--) {
    retArrayField.pop();
  }
}

export function parsePrimitive(
  sourceField: any,
  primitiveType: PrimitiveType
): any {
  switch (primitiveType) {
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

export let MESSAGE_PARSER = new MessageAssembler(
  checkSourceNonNull,
  nullifyOutput,
  checkArrayType,
  nullifyArray,
  popArrayUntilTargetLength,
  parsePrimitive,
  parseEnum
);

export function parseMessage<T>(
  raw: any,
  descriptor: MessageDescriptor<T>,
  output?: T
): T {
  return MESSAGE_PARSER.processMessageType(raw, descriptor, output);
}
