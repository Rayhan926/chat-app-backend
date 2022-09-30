import * as jose from 'jose';
import mongoose, { Types } from 'mongoose';
import { JWT_SECRET } from '../config/contants';
import { UserSchemaType } from '../types';

const userSchema = new mongoose.Schema<UserSchemaType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    username: String,
    friends: {
      type: [Types.ObjectId],
      ref: 'User',
      default: [],
    },
    friendRequests: {
      type: [Types.ObjectId],
      ref: 'User',
      default: [],
    },
    sentFriendRequests: {
      type: [Types.ObjectId],
      ref: 'User',
      default: [],
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    lastSeen: {
      type: Date,
      default: Date.now(),
    },
    socketId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// eslint-disable-next-line func-names
userSchema.methods.generateToken = async function () {
  const payload = {
    // eslint-disable-next-line no-underscore-dangle
    _id: this._id,
    status: !this.username ? 'incomplete' : 'completed',
  };

  const jwtToken = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(JWT_SECRET));

  return jwtToken;
};
const User = mongoose.model<UserSchemaType>('User', userSchema);
export default User;
