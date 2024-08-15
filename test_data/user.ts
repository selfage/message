import { MessageDescriptor, PrimitiveType, EnumDescriptor } from '../descriptor';

export interface User {
  id?: number,
  isPaid?: boolean,
  nickname?: string,
  email?: string,
  idHistory?: Array<number>,
  isPaidHistory?: Array<boolean>,
  nicknameHistory?: Array<string>,
}

export let USER: MessageDescriptor<User> = {
  name: 'User',
  fields: [
    {
      name: 'id',
      index: 1,
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'isPaid',
      index: 2,
      primitiveType: PrimitiveType.BOOLEAN,
    },
    {
      name: 'nickname',
      index: 3,
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'email',
      index: 4,
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'idHistory',
      index: 5,
      primitiveType: PrimitiveType.NUMBER,
      isArray: true
    },
    {
      name: 'isPaidHistory',
      index: 6,
      primitiveType: PrimitiveType.BOOLEAN,
      isArray: true
    },
    {
      name: 'nicknameHistory',
      index: 8,
      primitiveType: PrimitiveType.STRING,
      isArray: true
    },
  ]
};

export enum Color {
  RED = 10,
  BLUE = 1,
  GREEN = 2,
}

export let COLOR: EnumDescriptor<Color> = {
  name: 'Color',
  values: [
    {
      name: 'RED',
      value: 10,
    },
    {
      name: 'BLUE',
      value: 1,
    },
    {
      name: 'GREEN',
      value: 2,
    },
  ]
}

export interface UserInfo {
  intro?: string,
  backgroundColor?: Color,
  preferredColor?: Color,
  colorHistory?: Array<Color>,
}

export let USER_INFO: MessageDescriptor<UserInfo> = {
  name: 'UserInfo',
  fields: [
    {
      name: 'intro',
      index: 1,
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'backgroundColor',
      index: 2,
      enumType: COLOR,
    },
    {
      name: 'preferredColor',
      index: 3,
      enumType: COLOR,
    },
    {
      name: 'colorHistory',
      index: 4,
      enumType: COLOR,
      isArray: true
    },
  ]
};

export interface CreditCard {
  cardNumber?: number,
}

export let CREDIT_CARD: MessageDescriptor<CreditCard> = {
  name: 'CreditCard',
  fields: [
    {
      name: 'cardNumber',
      index: 1,
      primitiveType: PrimitiveType.NUMBER,
    },
  ]
};

export interface NestedUser {
  id?: number,
  userInfo?: UserInfo,
  creditCards?: Array<CreditCard>,
}

export let NESTED_USER: MessageDescriptor<NestedUser> = {
  name: 'NestedUser',
  fields: [
    {
      name: 'id',
      index: 1,
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'userInfo',
      index: 2,
      messageType: USER_INFO,
    },
    {
      name: 'creditCards',
      index: 3,
      messageType: CREDIT_CARD,
      isArray: true
    },
  ]
};
