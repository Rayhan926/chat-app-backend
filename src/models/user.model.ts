import * as jose from 'jose';
import mongoose from 'mongoose';
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
    // friends: [
    //   {
    //     _id: {
    //       type: Types.ObjectId,
    //       required: true,
    //     },
    //     status: {
    //       type: String,
    //       enum: ['pending', 'approved', 'blocked', 'waiting_for_approval'],
    //       default: 'pending',
    //     },
    //   },
    // ],
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
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  console.log({ jwtToken });

  return jwtToken;
};
const User = mongoose.model<UserSchemaType>('User', userSchema);
export default User;
