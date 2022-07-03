import { MessageDescriptor } from "./descriptor";
import { MessageAssembler } from "./assembler";

function checkArrayNonNull(sourceField: any): boolean {
  return Boolean(sourceField);
}

function nullifyArray(ret: any, fieldName: string): void {
  ret[fieldName] = undefined;
}

function popArrayUntilTargetLength(
  retArrayField: any,
  targetLength: number
): void {
  for (let i = retArrayField.length; i > targetLength; i--) {
    retArrayField.pop();
  }
}

function copyField(sourceField: any): any {
  return sourceField;
}

let MESSAGE_COPIER = new MessageAssembler(
  checkArrayNonNull,
  nullifyArray,
  popArrayUntilTargetLength,
  copyField,
  copyField
);

export function copyMessage<T>(
  from: T,
  descriptor: MessageDescriptor<T>,
  to?: T
): T {
  return MESSAGE_COPIER.assemble(from, descriptor, to);
}
