import { NextFunction, Request, Response } from 'express';
import { CreateResponse, ErrorWithStatusCode } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const expressErrorMiddleware = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.headersSent) {
    const { statusCode } = err;
    res.status(statusCode || 500).send(err.message || 'Server Error');
  } else {
    next(err);
  }
};

export const createResponse = ({ message, data }: CreateResponse): CreateResponse => ({
  message,
  data,
});
