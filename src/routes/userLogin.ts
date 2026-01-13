import { Router } from "express";
import z from "zod";
import { prisma } from "./prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userRoute: Router = Router();

const SafeData = z.object({
  name: z.string().max(15, "Name can't be longer!").nullable(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "password must be 8 character")
    .max(30, "password is too long"),
  mob_no: z
    .string()
    .max(10, "number can't be more than 10")
    .min(10, "number can't be lesser than 10"),
});

userRoute.post("/signup", async (req, res) => {
  const userDataa = SafeData.safeParse(req.body);

  const CheckingUser = await prisma.users.findFirst({
    where: {
      email: userDataa.data!.email,
    },
  });

  if (CheckingUser) {
    return res.status(409).json({
      msg: "Email or Mobile Number Already Exist!",
    });
  }

  try {
    if (userDataa.success) {
      const hashedPass: string = await bcrypt.hash(userDataa.data.password, 12);

      await prisma.users.create({
        data: {
          name: userDataa.data.name,
          email: userDataa.data.email,
          password: hashedPass,
          mobile_no: userDataa.data.mob_no,
        },
      });
      return res.json({
        msg: "Signed Up!",
      });
    } else {
      const errorformater = userDataa.error;
      console.log(errorformater.issues[0]);
      res.json({
        msg: `${errorformater.issues[0]?.path} : ${errorformater.issues[0]?.message}`,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

userRoute.post("/login", async (req, res) => {
  try {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const FindUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (FindUser) {
      const checkpass = await bcrypt.compare(password, FindUser.password);
      if (!checkpass) {
        return res.status(400).json({
          msg: "Entered Password is wrong",
        });
      } else {
        const tokens = jwt.sign(
          {
            token: FindUser.id,
            email: FindUser.email,
          },
          process.env.JWTSECRET as string,
          {
            expiresIn: "1d",
          }
        );
        return res.status(200).json({
          msg: "Logged In , Enjoy seamless payment!",
          token: tokens,
        });
      }
    } else {
      return res.json({
        msg: `user don't exist!, Kindly check email`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});
