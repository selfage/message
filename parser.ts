import {
  EnumDescriptor,
  EnumValue,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./descriptor";
import { ObservableArray } from "@selfage/observable_array";

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
    ret = descriptor.factoryFn();
  }
  for (let field of descriptor.fields) {
    if (!field.arrayFactoryFn && !field.observableArrayFactoryFn) {
      ret[field.name] = parseField(raw[field.name], field, ret[field.name]);
    } else if (
      !Array.isArray(raw[field.name]) &&
      !(raw[field.name] instanceof ObservableArray)
    ) {
      ret[field.name] = undefined;
    } else {
      let rawValues = raw[field.name];
      let retValues = ret[field.name];
      let retSetFn: (index: number, newValue: any) => void;
      let retGetFn: (index: number) => any;
      if (field.arrayFactoryFn) {
        if (!retValues) {
          retValues = field.arrayFactoryFn();
        }
        retSetFn = (index, newValue) => {
          retValues[index] = newValue;
        };
        retGetFn = (index) => {
          return retValues[index];
        };
      } else {
        // field.observableArrayFactoryFn
        if (!retValues) {
          retValues = field.observableArrayFactoryFn();
        }
        retSetFn = (index, newValue) => {
          retValues.set(index, newValue);
        };
        retGetFn = (index) => {
          return retValues.get(index);
        };
      }
      ret[field.name] = retValues;
      let i = 0;
      for (let element of rawValues) {
        if (i < retValues.length) {
          retSetFn(i, parseField(element, field, retGetFn(i)));
        } else {
          retValues.push(parseField(element, field));
        }
        i++;
      }
      for (let i = retValues.length; i > rawValues.length; i--) {
        retValues.pop();
      }
    }
  }
  return ret;
}

function parseField(
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
  } else if (field.enumDescriptor) {
    return parseEnum(rawField, field.enumDescriptor);
  } else if (field.messageDescriptor) {
    return parseMessage(rawField, field.messageDescriptor, outputField);
  }
}
