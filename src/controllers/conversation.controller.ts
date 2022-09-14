/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { NextFunction, Request, Response } from 'express';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';
import { UserType } from '../types';
import { createResponse } from '../utils';

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: UserType = (req as any).user;
    const conversations = await User.findById(_id)
      .select('friends')
      .populate(
        'friends',
        '-friendRequests -friends -sentFriendRequests -__v -createdAt -updatedAt'
      );

    const friends = conversations?.friends || [];
    const friendsWithMetaData: any[] = [];

    const getConversationMetaData = async () => {
      for (const friend of friends) {
        const lastMessage = await Conversation.findOne({
          $or: [{ senderId: _id }, { receiverId: _id }],
        }).sort({ _id: -1 });

        const unseenMessageCount = await Conversation.find()
          .where('status')
          .ne('seen')
          .where({
            receiverId: _id,
          })
          .count();

        const newFriendData = {
          ...(friend as any).toJSON(),
          lastMessage,
          unseenMessageCount,
        };

        friendsWithMetaData.push(newFriendData);
      }
    };

    await getConversationMetaData();

    res.send(
      createResponse({
        message: 'Success',
        data: friendsWithMetaData,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: UserType = (req as any).user;
    const { id } = req.params;

    console.log({ _id, id });

    const chats = await Conversation.find().or([
      { senderId: _id },
      { receiverId: _id },
      { senderId: id },
      { receiverId: id },
    ]);
    res.send(
      createResponse({
        message: 'Success',
        data: chats,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const sendChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id }: UserType = (req as any).user;
    const { sendTo, message } = req.body;

    const chat = new Conversation({
      message,
      senderId: _id,
      receiverId: sendTo,
    });
    await chat.save();

    res.send(
      createResponse({
        message: 'Success',
        data: chat,
      })
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};
