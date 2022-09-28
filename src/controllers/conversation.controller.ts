/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';
import { UserType } from '../types';
import { createResponse, getConversationId } from '../utils';

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
          conversationId: getConversationId(_id, friend?._id || ''),
        }).sort({ _id: -1 });

        const unseenMessageCount = await Conversation.find()
          .where('status')
          .ne('seen')
          .where({
            receiverId: _id,
            senderId: friend?._id,
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

    const { modifiedCount } = await Conversation.updateMany(
      {
        senderId: id,
        status: { $ne: 'seen' },
      },
      {
        $set: { status: 'seen' },
      }
    );

    if (modifiedCount > 0) {
      req.io.to(id).emit('seen-messages', {
        seenBy: _id.toString(),
      });
    }

    const chats = await Conversation.find({ conversationId: getConversationId(_id, id) });

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
    const { sendTo, message, attachmentsMeta } = req.body;

    const parsedAttachmentsMeta = attachmentsMeta && JSON.parse(attachmentsMeta);

    const files = req.files;
    const formatFiles = (files as any).map((file: any, index: number) => ({
      path: file.path.replace('public', ''),
      mimetype: file.mimetype,
      ...parsedAttachmentsMeta[index],
    }));

    const sendToUser = await User.findById(sendTo);

    if (!sendToUser) return next(createHttpError(404, 'Failed to sent message'));

    const messageStatus = sendToUser.status === 'online' ? 'delivered' : 'sent';

    const chat = new Conversation({
      message,
      senderId: _id,
      receiverId: sendToUser._id,
      status: messageStatus,
      attachments: files?.length ? formatFiles : [],
      conversationId: getConversationId(_id, sendToUser._id),
    });
    await chat.save();

    req.io.to(sendToUser._id.toString()).emit('new-message', chat);

    req.io.to(sendToUser._id.toString()).emit('typing', {
      typingStatus: false,
      to: sendToUser._id,
      from: _id,
    });
    req.io.to(_id.toString()).emit('cancelTyping');

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
