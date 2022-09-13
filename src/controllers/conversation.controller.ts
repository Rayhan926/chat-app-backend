import { NextFunction, Request, Response } from 'express';
import Friend from '../models/friend.model';
import { createResponse } from '../utils';

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  const { user }: any = req;
  const userId = user._id;
  try {
    const conversations1 = await Friend.find({ senderId: userId })
      .select('receiverId receiverStatus senderStatus')
      .populate('receiverId');

    const conversations2 = await Friend.find({ receiverId: userId })
      .select('senderId receiverStatus senderStatus')
      .populate('senderId');

    console.log({ conversations1 });
    res.send(
      createResponse({
        message: 'Success',
        data: [...conversations1, ...conversations2],
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
