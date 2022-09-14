/* eslint-disable no-nested-ternary */
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import User from '../models/user.model';
import { UserType } from '../types';

import { createResponse } from '../utils';

export const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserType = (req as any).user;
    const { sendTo } = req.body;

    // check if sendTo value is invalid
    if (!sendTo || sendTo === user.email || sendTo === user.username) {
      return next(createHttpError(400, 'Please provide an valid username or email'));
    }

    // User who we are sending the request to
    const toUser = await User.findOne({
      $or: [{ username: sendTo }, { email: sendTo }],
    });

    if (!toUser) {
      return res.send(
        createResponse({
          message: `Friend request sent. You will be notified once ${sendTo} accept your request`,
        })
      );
    }
    const sendToUserName = toUser.name;

    const myFriends = user.friends;
    const myFriendRequests = user.friendRequests;
    const mySentFriends = user.sentFriendRequests;

    const alreadyFriends = myFriends.includes(toUser._id);
    const alreadyGoRequest = myFriendRequests.includes(toUser._id);
    const alreadySentRequest = mySentFriends.includes(toUser._id);

    if (alreadyFriends || alreadyGoRequest || alreadySentRequest) {
      return res.status(401).send(
        createResponse({
          message: alreadyFriends
            ? `You and ${sendToUserName} are already friends`
            : alreadyGoRequest
            ? `You already got a friend request from ${sendToUserName}`
            : alreadySentRequest
            ? `You have a pending friend request with ${sendToUserName}`
            : 'Somrthing went wrong',
        })
      );
    }

    toUser.friendRequests.push(user._id);
    user.sentFriendRequests.push(toUser._id);

    await toUser.save();
    await user.save();

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
