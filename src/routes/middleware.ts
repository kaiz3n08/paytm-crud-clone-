import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface NewRequest extends Request {
  token?: {
    email: string;
    id: number;
  };
}

export async function UserAuth(
  req: NewRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const cookie = req.headers.token;
    if (!cookie) {
      return res.status(400).json({
        msg: "Token is not recevied!",
      });
    }
    const verifying = jwt.verify(
      cookie as string,
      process.env.JWTSECRET as string
    );
    if (verifying) {
      (req as JwtPayload).token = verifying;
      next();
    }
  } catch (error : any) {
    return res.status(400).json({
      msg: "token is wrong!",
      err: error.message,
    });
  }
}
