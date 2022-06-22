export interface EnumValue {
  name: string;
  value: number;
}

export interface EnumDescriptor<T> {
  name: string;
  values?: EnumValue[];
}

export enum PrimitiveType {
  NUMBER = 1,
  BOOLEAN = 2,
  STRING = 3,
}

export interface MessageField {
  name: string;
  primitiveType?: PrimitiveType;
  enumType?: EnumDescriptor<any>;
  messageType?: MessageDescriptor<any>;
  isArray?: true;
}

export interface MessageDescriptor<T> {
  name: string;
  fields?: MessageField[];
}
