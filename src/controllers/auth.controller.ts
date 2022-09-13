import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import { createResponse } from '../utils';

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenId } = req.body;

    // get user data from access token
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: tokenId,
      },
    });

    // check if user exist
    const existingUser: any = await User.findOne({ email: data.email });

    if (existingUser) {
      const token = await existingUser.generateToken();

      res.send(
        createResponse({
          message: 'Login success',
          data: {
            token,
            user: existingUser,
          },
        })
      );
    } else {
      // create user
      const user = new User({
        name: data.name,
        email: data.email,
        avatar: data.picture,
        username: data.email.split('@')[0],
      });

      await user.save();
      const token = await (user as any).generateToken();
      res.send(
        createResponse({
          data: {
            token,
            user,
          },
          message: 'Login success',
        })
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
