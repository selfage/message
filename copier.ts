import { MessageAssembler } from "./assembler";
import { MessageDescriptor } from "./descriptor";

export function checkSourceNonNull(source: any): boolean {
  return Boolean(source);
}

export function nullifyOutput(): any {
  return undefined;
}

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
  checkSourceNonNull,
  nullifyOutput,
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
  return MESSAGE_COPIER.processMessageType(from, descriptor, to);
}
