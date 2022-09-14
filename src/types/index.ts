/* eslint-disable no-use-before-define */
// eslint-disable-next-line object-curly-newline
import { Document, HydratedDocument, Model, Query, Types } from 'mongoose';

export type ErrorWithStatusCode = {
  statusCode: number;
} & Error;
export type CreateResponse = {
  data?: unknown;
  message: string;
};

type FrinedStatusEnums = 'pending' | 'approved' | 'blocked' | 'waiting_for_approval' | 'rejected';

export type Friend = {
  senderId: Types.ObjectId | undefined;
  receiverId: Types.ObjectId | undefined;
  senderStatus?: FrinedStatusEnums;
  receiverStatus?: FrinedStatusEnums;
};

type ProjectModelQuery = Query<any, HydratedDocument<Friend>, FriendQueryHelpers> &
  FriendQueryHelpers;

export type FriendQueryHelpers = {
  test(this: ProjectModelQuery, name: string): ProjectModelQuery;
};
export type FriendModelType = Model<Friend, FriendQueryHelpers>;

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
export type ConversationSchemaType = {
  senderId: Types.ObjectId | undefined;
  receiverId: Types.ObjectId | undefined;
  message: string;
  status: 'sent' | 'delivered' | 'seen';
};

export type UserType = Document<unknown, any, UserSchemaType> &
  UserSchemaType & {
    _id: Types.ObjectId;
  };
