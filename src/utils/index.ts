/* eslint-disable no-param-reassign */
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { SERVER_BASE_URL } from '../config/contants';
import { CreateResponse, ErrorWithStatusCode } from '../types';

export const createResponse = ({ message, data }: CreateResponse): CreateResponse => ({
  message,
  data,
});

// eslint-disable-next-line import/prefer-default-export
export const expressErrorMiddleware = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.headersSent) {
    console.log('Error middleware if block', err);
    const { statusCode } = err;
    res.status(statusCode || 500).send(
      createResponse({
        message: err.message || 'Server Error',
        data: null,
      })
    );
  } else {
    console.log('Error middleware else block', err);
    next(err);
  }
};

type ObjectIdOrString = Types.ObjectId | string;
export const getConversationId = (senderId: ObjectIdOrString, receiverId: ObjectIdOrString) => {
  if (senderId instanceof Types.ObjectId) {
    senderId = senderId.toString();
  }
  if (receiverId instanceof Types.ObjectId) {
    receiverId = receiverId.toString();
  }
  return [senderId, receiverId].sort().join('');
};
export const getApiFullPath = (endPoint: string) => SERVER_BASE_URL + endPoint;
