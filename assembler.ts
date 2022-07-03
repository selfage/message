import {
  EnumDescriptor,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./descriptor";

export class MessageAssembler {
  public constructor(
    private arrayCheckFn: (sourceField: any) => boolean,
    private arrayResetFn: (ret: any, fieldName: string) => void,
    private arrayPopFn: (retArrayField: any, targetLength: number) => void,
    private processPrimitiveType: (
      sourceField: any,
      primitiveType: PrimitiveType,
      outputField?: any
    ) => any,
    private processEnumType: (
      sourceField: any,
      enumType: EnumDescriptor<any>,
      outputField?: any
    ) => any
  ) {}

  public processMessageType<T>(
    source: any,
    descriptor: MessageDescriptor<T>,
    output?: T
  ): T {
    if (!source || typeof source !== "object") {
      return undefined;
    }

    let ret: any = output;
    if (!ret) {
      ret = {};
    }
    for (let field of descriptor.fields) {
      if (!field.isArray) {
        ret[field.name] = this.processField(
          source[field.name],
          field,
          ret[field.name]
        );
      } else if (!this.arrayCheckFn(source[field.name])) {
        this.arrayResetFn(ret, field.name);
      } else {
        if (!this.arrayCheckFn(ret[field.name])) {
          ret[field.name] = [];
        }
        let sourceArrayField = source[field.name];
        let retArrayField = ret[field.name];
        let i = 0;
        for (let element of sourceArrayField) {
          if (i < retArrayField.length) {
            retArrayField[i] = this.processField(
              element,
              field,
              retArrayField[i]
            );
          } else {
            retArrayField.push(this.processField(element, field));
          }
          i++;
        }
        this.arrayPopFn(retArrayField, sourceArrayField.length);
      }
    }
    return ret;
  }

  private processField(
    sourceField: any,
    field: MessageField,
    outputField?: any
  ): any {
    if (field.primitiveType) {
      return this.processPrimitiveType(
        sourceField,
        field.primitiveType,
        outputField
      );
    } else if (field.enumType) {
      return this.processEnumType(sourceField, field.enumType, outputField);
    } else if (field.messageType) {
      return this.processMessageType(
        sourceField,
        field.messageType,
        outputField
      );
    }
  }
}
