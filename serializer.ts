import { MessageDescriptor } from "./descriptor";
import { parseMessageInPlace } from "./parser_in_place";
import { BSON } from "bson";

export function toArray(
  message: any,
  descriptor: MessageDescriptor<any>,
): Array<any> {
  let asArray = new Array<any>();
  for (let field of descriptor.fields) {
    if (field.isArray) {
      for (let value of message[field.name]) {
        if (field.messageType) {
          asArray.push([field.index, toArray(value, field.messageType)]);
        } else {
          asArray.push([field.index, value]);
        }
      }
    } else {
      if (message[field.name] === undefined) {
        continue;
      }
      if (field.messageType) {
        asArray.push([
          field.index,
          toArray(message[field.name], field.messageType),
        ]);
      } else {
        asArray.push([field.index, message[field.name]]);
      }
    }
  }
  return asArray;
}

export function serializeMessage<T>(
  message: T,
  descriptor: MessageDescriptor<T>,
): Uint8Array {
  return BSON.serialize({ a: toArray(message, descriptor) });
}

export function fromArray(
  asArray: Array<any>,
  descriptor: MessageDescriptor<any>,
  output?: any,
): any {
  if (!(asArray instanceof Array)) {
    return undefined;
  }

  let ret: any = output;
  if (!ret) {
    ret = {};
  }

  let i = 0;
  for (let element of asArray) {
    let index = element[0];
    while (descriptor.fields[i].index < index) {
      i++;
    }
    if (descriptor.fields[i].index > index) {
      continue;
    }
    let field = descriptor.fields[i];
    if (field.isArray) {
      if (!ret[field.name]) {
        ret[field.name] = [];
      }
      if (field.messageType) {
        ret[field.name].push(fromArray(element[1], field.messageType));
      } else {
        ret[field.name].push(element[1]);
      }
    } else {
      if (field.messageType) {
        ret[field.name] = fromArray(element[1], field.messageType);
      } else {
        ret[field.name] = element[1];
      }
    }
  }
  return ret;
}

export function deserializeMessage<T>(
  raw: Uint8Array,
  descriptor: MessageDescriptor<T>,
): T {
  return parseMessageInPlace(
    fromArray(BSON.deserialize(raw)["a"] as Array<any>, descriptor),
    descriptor,
  );
}
