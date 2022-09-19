/* eslint-disable no-use-before-define */
// eslint-disable-next-line object-curly-newline
import { Document, Types } from 'mongoose';

export type ErrorWithStatusCode = {
  statusCode: number;
} & Error;
export type CreateResponse = {
  data?: unknown;
  message: string;
};
export type UserSchemaType = {
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  friends: (Types.ObjectId | undefined)[];
  friendRequests: (Types.ObjectId | undefined)[];
  sentFriendRequests: (Types.ObjectId | undefined)[];
  status: 'online' | 'offline';
};

type Attachments = {
  path: string;
  mimetype: string;
};

export type ConversationSchemaType = {
  senderId: Types.ObjectId | undefined;
  receiverId: Types.ObjectId | undefined;
  message?: string;
  status: 'sent' | 'delivered' | 'seen';
  attachments: Attachments[];
};

export type UserType = Document<unknown, any, UserSchemaType> &
  UserSchemaType & {
    _id: Types.ObjectId;
  };
