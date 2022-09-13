/* eslint-disable no-nested-ternary */
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Friend from '../models/friend.model';
import User from '../models/user.model';

import { createResponse } from '../utils';

export const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user }: any = req;
    const { sendTo } = req.body;

    // check if sendTo value is invalid
    if (!sendTo || sendTo === user.email || sendTo === user.username) {
      return next(createHttpError(400, 'Please provide an valid username or email'));
    }

    // User who we are sending the request to
    const sendToUser = await User.findOne({
      $or: [{ username: sendTo }, { email: sendTo }],
    });
    if (!sendToUser) {
      return res.send(
        createResponse({
          message: `Friend request sent. You will be notified once ${sendTo} accept your request`,
        })
      );
    }

    const allRequests = await Friend.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });

    // hasInList --> Has in frined list
    const hasInList = allRequests.find(
      (_u) => _u.senderId?.equals(sendToUser._id) || _u.receiverId?.equals(sendToUser._id)
    );

    const sendToUserName = sendToUser.email;

    if (hasInList) {
      // eslint-disable-next-line object-curly-newline
      const { senderStatus, receiverStatus, receiverId, senderId } = hasInList;
      const isSender = senderId?.equals(user._id);
      const isReceiver = receiverId?.equals(user._id);

      //   const isSenderApproved = senderStatus === 'approved';
      //   const isSenderRejected = senderStatus === 'rejected';
      const isSenderPending = senderStatus === 'pending';
      const isSenderBlocked = senderStatus === 'blocked';

      const isReceiverApproved = receiverStatus === 'approved';
      const isReceiverRejected = receiverStatus === 'rejected';
      const isReceiverBlocked = receiverStatus === 'blocked';
      const isReceiverAwaiting = receiverStatus === 'waiting_for_approval';
      return res.send(
        createResponse({
          message:
            isReceiverApproved && !isSenderBlocked
              ? `You and ${sendToUserName} are already friends`
              : isSender && isReceiverAwaiting
              ? `You have a pending friend request with ${sendToUserName}`
              : isSender && isReceiverBlocked
              ? `You have been blocked from ${sendToUserName}`
              : isSender && isReceiverRejected
              ? `Your request have been rejected from ${sendToUserName}`
              : (isSender && isSenderBlocked) || (isReceiver && isReceiverBlocked)
              ? `You blocked ${sendToUserName}. Unblock to start chating again`
              : isReceiver && isSenderBlocked
              ? `You have been blocked from ${sendToUserName}`
              : isReceiver && isSenderPending
              ? `You already got a friend request from ${sendToUserName}`
              : 'Something went wrong!',
        })
      );
    }

    const friendRequest = new Friend({
      senderId: user._id,
      receiverId: sendToUser._id,
    });
    await friendRequest.save();

    res.send(
      createResponse({
        message: `Friend request sent. You will be notified once ${sendToUserName} accept your request`,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
