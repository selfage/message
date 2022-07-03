import { MessageDescriptor } from "./descriptor";
import { MessageAssembler } from "./assembler";

export function checkArrayNonNull(sourceField: any): boolean {
  return Boolean(sourceField);
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

export function copyField(sourceField: any): any {
  return sourceField;
}

export let MESSAGE_COPIER = new MessageAssembler(
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
