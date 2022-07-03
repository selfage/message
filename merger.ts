import { MessageDescriptor } from "./descriptor";
import { MessageAssembler } from "./assembler";

export function checkArrayNonNull(sourceField: any): boolean {
  return Boolean(sourceField);
}

export function noop(): void {}

export function mergeField(sourceField: any, type: any, outputField: any): any {
  if (sourceField !== undefined) {
    return sourceField;
  } else {
    return outputField;
  }
}

export let MESSAGE_MERGER = new MessageAssembler(
  checkArrayNonNull,
  noop,
  noop,
  mergeField,
  mergeField
);

export function mergeMessage<T>(
  from: T,
  descriptor: MessageDescriptor<T>,
  to?: T
): T {
  return MESSAGE_MERGER.assemble(from, descriptor, to);
}
