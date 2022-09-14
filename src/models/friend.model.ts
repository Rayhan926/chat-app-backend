/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/ban-types */
import mongoose, { Types } from 'mongoose';
import { Friend, FriendModelType, FriendQueryHelpers } from '../types';

const frinedStatusEnums = ['pending', 'approved', 'blocked', 'waiting_for_approval', 'rejected'];

const friendSchema = new mongoose.Schema<Friend, FriendModelType, {}, FriendQueryHelpers>(
  {
    senderId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiverId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    senderStatus: {
      type: String,
      enum: frinedStatusEnums,
      default: 'pending',
    },
    receiverStatus: {
      type: String,
      enum: frinedStatusEnums,
      default: 'waiting_for_approval',
    },
  },
  {
    timestamps: true,
  }
);

friendSchema.query.test = function () {
  return this.find();
};

const Friend = mongoose.model<Friend, FriendModelType>('Friend', friendSchema);
export default Friend;
