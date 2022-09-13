import { NextFunction, Request, Response } from 'express';

import { createResponse } from '../utils';

export const getUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user }: any = req;
    delete user._doc.friends;

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
