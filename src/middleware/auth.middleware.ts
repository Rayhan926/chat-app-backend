import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import * as jose from 'jose';
import { JWT_SECRET } from '../config/contants';
import User from '../models/user.model';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers?.authorization;
    if (!token) return next(createHttpError(401, 'Unauthorized'));

    const splitedToken = token.split(' ')[1];

    const jwt = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jose.jwtVerify(splitedToken, jwt);

    if (!payload) return next(createHttpError(401, 'Unauthorized'));

    const user = await User.findOne({ _id: payload._id });
    if (!user) return next(createHttpError(401, 'Unauthorized'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = user;
    // await new Promise((resolve) =>
    //   // eslint-disable-next-line no-promise-executor-return
    //   setTimeout(() => {
    //     resolve(null);
    //   }, 1000)
    // );
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default auth;
