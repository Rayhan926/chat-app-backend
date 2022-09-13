import { NextFunction, Request, Response } from 'express';
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
    const { statusCode } = err;
    res.status(statusCode || 500).send(
      createResponse({
        message: err.message || 'Server Error',
        data: null,
      })
    );
  } else {
    next(err);
  }
};
