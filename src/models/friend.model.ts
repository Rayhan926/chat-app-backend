import mongoose, { Types } from 'mongoose';
import { FriendSchemaType } from '../types';

const frinedStatusEnums = ['pending', 'approved', 'blocked', 'waiting_for_approval', 'rejected'];

const friendSchema = new mongoose.Schema<FriendSchemaType>(
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

const Friend = mongoose.model<FriendSchemaType>('Friend', friendSchema);
export default Friend;
