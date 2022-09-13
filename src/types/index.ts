import { Types } from 'mongoose';

export type ErrorWithStatusCode = {
  statusCode: number;
} & Error;
export type CreateResponse = {
  data?: unknown;
  message: string;
};

type FrinedStatusEnums = 'pending' | 'approved' | 'blocked' | 'waiting_for_approval' | 'rejected';

export type FriendSchemaType = {
  senderId: Types.ObjectId | undefined;
  receiverId: Types.ObjectId | undefined;
  senderStatus?: FrinedStatusEnums;
  receiverStatus?: FrinedStatusEnums;
};

export type UserSchemaType = {
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  // friends: FriendSchemaType[];
};
export type ConversationSchemaType = {
  senderId: Types.ObjectId | undefined;
  receiverId: Types.ObjectId | undefined;
  message: string;
  messageType?: 'regular' | 'friend_request';
};
