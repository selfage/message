import {
  EnumDescriptor,
  MessageDescriptor,
  MessageField,
  PrimitiveType,
} from "./descriptor";

// Binary format example.
// From {1: 1, 2: true, 3: {}, 4: {1: 1}, 5: "a", 6: [1]}
// To <6 (Uint32 for number of fields)><1 (Uint32 for index)><1 (Float64 for number value)><2 (Uint32 for index)><1 (Uint8 for boolean value)><3 (Uint32 for index)><0 (Uint32 for byte size)><4 (Uint32 for index)><12 (Uint32 for byte size)><1 (Uint32 for index)><1 (Float64 for number value)><5 (Uint32 for index)><1 (Uint32 for byte length)><97 (Uint8 for UTF8 encoding)><6 (Uint32 for index)><1 (Uint32 for array size)><1 (Float64 for number value)>
//
// Requirements:
//   1. Index, enum value, and array length must be < 2^32.
//   2. Number of fields, and string byte length must be < 2^32 - 1 (NOTE!).
//   3. Field index and enum value must be > 0.
//
// Handling `undefined` and `null`:
//   1. If a field is undefined/null, it's ignored when serialized.
//   2. If an element of an array is undefined/null, it will be kept as undefined in the array.
//
// Maximum byte size by default is 16MB, but can be changed globally using `initBuffer(maxBytes: number)`.

let UINT32_VALUE_FOR_UNDEFINED = 4294967295;
let BOOLEAN_VALUE_FOR_UNDEFINED = 2;
let RESERVED_UINT8_ARRAY: Uint8Array;
let DATA_VIEW_OF_RESERVED_ARRAY: DataView;
let TEXT_ENCODER = new TextEncoder();
let TEXT_DECODER = new TextDecoder();

export function initBuffer(maxBytes = 1024 * 1024 * 16): void {
  RESERVED_UINT8_ARRAY = new Uint8Array(maxBytes);
  DATA_VIEW_OF_RESERVED_ARRAY = new DataView(RESERVED_UINT8_ARRAY.buffer);
}

initBuffer();

export function toBufferFromValue(
  value: any,
  field: MessageField,
  uint8Array: Uint8Array,
  dataView: DataView,
  byteOffset: number,
): number {
  if (field.primitiveType) {
    switch (field.primitiveType) {
      case PrimitiveType.NUMBER:
        if (value == null) {
          dataView.setFloat64(byteOffset, NaN, true);
        } else {
          dataView.setFloat64(byteOffset, value, true);
        }
        byteOffset += 8;
        break;
      case PrimitiveType.BOOLEAN:
        if (value == null) {
          dataView.setUint8(byteOffset, BOOLEAN_VALUE_FOR_UNDEFINED);
        } else {
          dataView.setUint8(byteOffset, value);
        }
        byteOffset += 1;
        break;
      case PrimitiveType.STRING:
        if (value == null) {
          dataView.setUint32(byteOffset, UINT32_VALUE_FOR_UNDEFINED, true);
          byteOffset += 4;
        } else {
          let res = TEXT_ENCODER.encodeInto(
            value,
            uint8Array.subarray(byteOffset + 4),
          );
          dataView.setUint32(byteOffset, res.written, true);
          byteOffset += 4 + res.written;
        }
        break;
    }
  } else if (field.enumType) {
    if (value == null) {
      dataView.setUint32(byteOffset, 0, true);
    } else {
      dataView.setUint32(byteOffset, value, true);
    }
    byteOffset += 4;
  } else {
    // message type
    byteOffset = toBufferFromMessage(
      value,
      field.messageType,
      uint8Array,
      dataView,
      byteOffset,
    );
  }
  return byteOffset;
}

export function toBufferFromMessage(
  message: any,
  descriptor: MessageDescriptor<any>,
  uint8Array: Uint8Array,
  dataView: DataView,
  byteOffset: number,
): number {
  if (!message) {
    dataView.setUint32(byteOffset, UINT32_VALUE_FOR_UNDEFINED, true);
    return byteOffset + 4;
  }

  let numOfFields = 0;
  let byteOffsetForNumOfFields = byteOffset;
  byteOffset += 4;
  for (let field of descriptor.fields) {
    if (message[field.name] == null) {
      continue;
    }
    numOfFields += 1;

    dataView.setUint32(byteOffset, field.index, true);
    byteOffset += 4;

    if (field.isArray) {
      dataView.setUint32(byteOffset, message[field.name].length, true);
      byteOffset += 4;
      for (let value of message[field.name]) {
        byteOffset = toBufferFromValue(
          value,
          field,
          uint8Array,
          dataView,
          byteOffset,
        );
      }
    } else {
      byteOffset = toBufferFromValue(
        message[field.name],
        field,
        uint8Array,
        dataView,
        byteOffset,
      );
    }
  }
  dataView.setUint32(byteOffsetForNumOfFields, numOfFields, true);
  return byteOffset;
}

export function serializeMessage<T>(
  message: T,
  descriptor: MessageDescriptor<T>,
): Uint8Array {
  let byteOffset = toBufferFromMessage(
    message,
    descriptor,
    RESERVED_UINT8_ARRAY,
    DATA_VIEW_OF_RESERVED_ARRAY,
    0,
  );
  return RESERVED_UINT8_ARRAY.slice(0, byteOffset);
}

export function toEnumFromNumber(
  sourceValue: number,
  enumType: EnumDescriptor<any>,
): number {
  let found = enumType.values.find((enumValue): boolean => {
    return enumValue.value === sourceValue;
  });
  if (found === undefined) {
    return undefined;
  } else {
    return sourceValue;
  }
}

export function toValueFromBinary(
  dataView: DataView,
  byteOffset: number,
  field: MessageField,
): { value: any; byteOffset: number } {
  let value: any;
  if (field.primitiveType) {
    switch (field.primitiveType) {
      case PrimitiveType.NUMBER:
        value = dataView.getFloat64(byteOffset, true);
        if (isNaN(value)) {
          value = undefined;
        }
        byteOffset += 8;
        break;
      case PrimitiveType.BOOLEAN:
        value = dataView.getUint8(byteOffset);
        if (value === BOOLEAN_VALUE_FOR_UNDEFINED) {
          value = undefined;
        } else {
          value = Boolean(value);
        }
        byteOffset += 1;
        break;
      case PrimitiveType.STRING:
        let stringByteLength = dataView.getUint32(byteOffset, true);
        byteOffset += 4;
        if (stringByteLength === UINT32_VALUE_FOR_UNDEFINED) {
          value = undefined;
        } else {
          value = TEXT_DECODER.decode(
            new Uint8Array(
              dataView.buffer,
              dataView.byteOffset + byteOffset,
              stringByteLength,
            ),
          );
          byteOffset += stringByteLength;
        }
        break;
    }
  } else if (field.enumType) {
    let enumSourceValue = dataView.getUint32(byteOffset, true);
    byteOffset += 4;
    value = toEnumFromNumber(enumSourceValue, field.enumType);
  } else {
    // message type
    let messageAndByteOffset = toMessageFromBinary(
      dataView,
      byteOffset,
      field.messageType,
    );
    value = messageAndByteOffset.message;
    byteOffset = messageAndByteOffset.byteOffset;
  }
  return { value, byteOffset };
}

export function toMessageFromBinary<T>(
  dataView: DataView,
  byteOffset: number,
  descriptor: MessageDescriptor<T>,
): { message?: T; byteOffset: number } {
  let numOfFields = dataView.getUint32(byteOffset, true);
  byteOffset += 4;
  if (numOfFields === UINT32_VALUE_FOR_UNDEFINED) {
    return {
      byteOffset,
    };
  }

  let message: any = {};
  let i = 0;
  for (let j = 0; j < numOfFields; j++) {
    let index = dataView.getUint32(byteOffset, true);
    byteOffset += 4;
    while (i < descriptor.fields.length && descriptor.fields[i].index < index) {
      i++;
    }
    if (index !== descriptor.fields[i].index) {
      throw new Error(
        `Index ${index} is not found in the message descriptor of ${descriptor.name}.`,
      );
    }
    let field = descriptor.fields[i];
    if (field.isArray) {
      let arrayLength = dataView.getUint32(byteOffset, true);
      byteOffset += 4;
      let arrayField = new Array<any>();
      message[field.name] = arrayField;
      for (let m = 0; m < arrayLength; m++) {
        let valueAndByteOffset = toValueFromBinary(dataView, byteOffset, field);
        arrayField.push(valueAndByteOffset.value);
        byteOffset = valueAndByteOffset.byteOffset;
      }
    } else {
      let valueAndByteOffset = toValueFromBinary(dataView, byteOffset, field);
      message[field.name] = valueAndByteOffset.value;
      byteOffset = valueAndByteOffset.byteOffset;
    }
  }
  return { message, byteOffset };
}

export function deserializeMessage<T>(
  binary: Uint8Array | undefined | null,
  descriptor: MessageDescriptor<T>,
): T {
  if (!binary) {
    return undefined;
  }
  return toMessageFromBinary(
    new DataView(binary.buffer, binary.byteOffset, binary.byteLength),
    0,
    descriptor,
  ).message;
}
