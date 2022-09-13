import mongoose, { Types } from 'mongoose';
import { ConversationSchemaType } from '../types';

const conversationSchema = new mongoose.Schema<ConversationSchemaType>(
  {
    senderId: {
      type: Types.ObjectId,
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['regular', 'friend_request'],
      default: 'regular',
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model<ConversationSchemaType>('Conversation', conversationSchema);
export default Conversation;
