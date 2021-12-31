import {
  MessageDescriptor,
  MessageField,
} from "./descriptor";

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
    ret = descriptor.factoryFn();
  }
  for (let field of descriptor.fields) {
    if (!field.arrayFactoryFn && !field.observableArrayFactoryFn) {
      ret[field.name] = mergeField(source[field.name], field, ret[field.name]);
    } else if (source[field.name]) {
      let sourceValues = source[field.name];
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
      for (let element of sourceValues) {
        if (i < retValues.length) {
          retSetFn(i, mergeField(element, field, retGetFn(i)));
        } else {
          retValues.push(mergeField(element, field));
        }
        i++;
      }
    }
  }
  return ret;
}

function mergeField(
  sourceField: any,
  field: MessageField,
  outputField?: any
): any {
  if (field.primitiveType || field.enumDescriptor) {
    if (sourceField !== undefined) {
      return sourceField;
    } else {
      return outputField;
    }
  } else if (field.messageDescriptor) {
    return mergeMessage(sourceField, field.messageDescriptor, outputField);
  }
}
