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
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'isPaid',
      primitiveType: PrimitiveType.BOOLEAN,
    },
    {
      name: 'nickname',
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'email',
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'idHistory',
      primitiveType: PrimitiveType.NUMBER,
      isArray: true
    },
    {
      name: 'isPaidHistory',
      primitiveType: PrimitiveType.BOOLEAN,
      isArray: true
    },
    {
      name: 'nicknameHistory',
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
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'backgroundColor',
      enumType: COLOR,
    },
    {
      name: 'preferredColor',
      enumType: COLOR,
    },
    {
      name: 'colorHistory',
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
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'userInfo',
      messageType: USER_INFO,
    },
    {
      name: 'creditCards',
      messageType: CREDIT_CARD,
      isArray: true
    },
  ]
};
