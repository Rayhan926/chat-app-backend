import mongoose, { Types } from 'mongoose';
import { ConversationSchemaType } from '../types';

const conversationSchema = new mongoose.Schema<ConversationSchemaType>(
  {
    conversationId: {
      type: String,
      required: true,
    },
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
      default: null,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    attachments: [
      {
        path: String,
        mimetype: String,
        width: Number,
        height: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model<ConversationSchemaType>('Conversation', conversationSchema);
export default Conversation;
