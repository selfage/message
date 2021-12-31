import {
  MessageDescriptor,
  MessageField,
} from "./descriptor";

export function copyMessage<T>(
  fromMessage: T,
  descriptor: MessageDescriptor<T>,
  toMessage?: T
): T {
  if (!fromMessage) {
    return undefined;
  }

  let source: any = fromMessage;
  let ret: any = toMessage;
  if (!ret) {
    ret = descriptor.factoryFn();
  }
  for (let field of descriptor.fields) {
    if (!field.arrayFactoryFn && !field.observableArrayFactoryFn) {
      ret[field.name] = copyField(source[field.name], field, ret[field.name]);
    } else if (!source[field.name]) {
      ret[field.name] = undefined;
    } else {
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
          retSetFn(i, copyField(element, field, retGetFn(i)));
        } else {
          retValues.push(copyField(element, field));
        }
        i++;
      }
      for (let i = retValues.length; i > sourceValues.length; i--) {
        retValues.pop();
      }
    }
  }
  return ret;
}

function copyField(
  sourceField: any,
  field: MessageField,
  outputField?: any
): any {
  if (field.primitiveType || field.enumDescriptor) {
    return sourceField;
  } else if (field.messageDescriptor) {
    return copyMessage(sourceField, field.messageDescriptor, outputField);
  }
}
