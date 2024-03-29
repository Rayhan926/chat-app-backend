/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';
import { UserType } from '../types';
import { createResponse } from '../utils';

export const getUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user }: any = req;
    delete user._doc.friends;
    delete user._doc.friendRequests;
    delete user._doc.sentFriendRequests;

    res.send(
      createResponse({
        message: 'Success',
        data: user,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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
      return next(createHttpError(401, `No user found with this username '${sendTo}'`));
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

    toUser.newFriendRequestsNotification += 1;

    await toUser.save();
    await user.save();

    req.io.to(toUser.id).emit('new-friend-request', {
      user,
      newFriendRequestsNotification: toUser.newFriendRequestsNotification,
    });

    res.send(
      createResponse({
        data: toUser,
        message: `Friend request sent. You will be notified once ${sendToUserName} accept your request`,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const sentFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: UserType = (req as any).user;

    const user = await User.findById(_id)
      .select('sentFriendRequests')
      .populate(
        'sentFriendRequests',
        '-friendRequests -friends -sentFriendRequests -__v -createdAt -updatedAt'
      );

    res.send(
      createResponse({
        message: 'Success',
        data: user?.sentFriendRequests || [],
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: UserType = (req as any).user;

    const user = await User.findById(_id)
      .select('friendRequests')
      .populate(
        'friendRequests',
        '-friendRequests -friends -sentFriendRequests -__v -createdAt -updatedAt'
      );

    res.send(
      createResponse({
        message: 'Success',
        data: user?.friendRequests || [],
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserType = (req as any).user;
    const acceptToId = req.body?.id;
    const acceptTo = await User.findById(acceptToId);

    if (!acceptTo || !acceptToId) {
      return next(createHttpError(400, 'Failed to accept the friend request'));
    }

    if (
      !acceptTo.sentFriendRequests.includes(user._id) ||
      !user.friendRequests.includes(acceptToId)
    ) {
      return next(createHttpError(404, `You don't have any request from ${acceptTo.name}`));
    }

    // adding user id in frineds list
    acceptTo.friends.push(user._id);
    user.friends.push(acceptTo._id);

    // removing user id from friendRequests and sentFriendRequests
    user.friendRequests = user.friendRequests.filter((request) => !request?.equals(acceptTo._id));
    acceptTo.sentFriendRequests = acceptTo.sentFriendRequests.filter(
      (request) => !request?.equals(user._id)
    );

    user.newFriendRequestsNotification -= 1;

    // saving users
    await user.save();
    await acceptTo.save();

    req.io.to(acceptTo.id).emit('friend-request-accept', user);

    res.send(
      createResponse({
        data: acceptTo,
        message: `You and ${acceptTo.name} are friends now!`,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const cancelFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserType = (req as any).user;

    const { id: cancelToId, type } = req.body;

    const myToDelete = type === 'cancel' ? 'sentFriendRequests' : 'friendRequests';
    const userToDelete = type === 'cancel' ? 'friendRequests' : 'sentFriendRequests';

    if (!cancelToId) return next(createHttpError(400, 'Failed to cancel the friend request'));

    const cancelTo = await User.findById(cancelToId);
    if (!cancelTo) return next(createHttpError(400, 'Failed to cancel the friend request'));

    // removeing user id
    cancelTo[userToDelete] = cancelTo[userToDelete].filter((friend) => !friend?.equals(user._id));
    user[myToDelete] = user[myToDelete].filter((friend) => !friend?.equals(cancelTo._id));

    if (type === 'reject') {
      user.newFriendRequestsNotification -= 1;
    }

    await cancelTo.save();
    await user.save();

    if (type === 'cancel') {
      req.io.to(cancelTo.id).emit('cancel-friend-request', user);
    } else {
      req.io.to(cancelTo.id).emit('reject-friend-request', user);
    }

    res.send(
      createResponse({
        message:
          type === 'cancel' ? 'Friend request cancelled' : `You rejected ${cancelTo.name} request`,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const removeAllFrineds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedUsers = await User.updateMany(
      {},
      {
        friends: [],
        friendRequests: [],
        sentFriendRequests: [],
        newFriendRequestsNotification: 0,
      }
    );

    await Conversation.deleteMany();

    res.send(
      createResponse({
        message: 'Success',
        data: updatedUsers,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const removeUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await User.deleteMany();
    res.send(
      createResponse({
        message: 'Success',
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const updateUserSocketId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: UserType = (req as any).user;
    const socketId = req.body.socketId;

    const user = await User.findById(_id);

    if (!user) return next(createHttpError(404, 'User not found'));

    for (const friend of user.friends) {
      req.io.to(friend?.toString() || '').emit('user-online', {
        userId: _id,
      });
    }

    user.status = 'online';
    user.socketId = socketId;
    await user.save();

    res.send(
      createResponse({
        message: 'Socket id updated',
        data: socketId,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const removeUserSocketId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const socketId = req.body.socketId;

    const user = await User.findOne({ socketId });
    if (!user) return next(createHttpError(404, 'User not found'));

    const dateNow = new Date(Date.now());

    user.socketId = null;
    user.status = 'offline';
    user.lastSeen = dateNow;

    for (const friend of user.friends) {
      req.io.to(friend?.toString() || '').emit('user-offline', {
        userId: user._id,
        lastSeen: dateNow,
      });
    }

    await user.save();

    res.send(
      createResponse({
        message: 'Success',
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
