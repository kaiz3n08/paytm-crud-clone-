var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import z from "zod";
import { prisma } from "./prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const userRoute = Router();
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
userRoute.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userDataa = SafeData.safeParse(req.body);
    const CheckingUser = yield prisma.users.findFirst({
        where: {
            email: userDataa.data.email,
        },
    });
    if (CheckingUser) {
        return res.status(409).json({
            msg: "Email or Mobile Number Already Exist!",
        });
    }
    try {
        if (userDataa.success) {
            const hashedPass = yield bcrypt.hash(userDataa.data.password, 12);
            yield prisma.users.create({
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
        }
        else {
            const errorformater = userDataa.error;
            console.log(errorformater.issues[0]);
            res.json({
                msg: `${(_a = errorformater.issues[0]) === null || _a === void 0 ? void 0 : _a.path} : ${(_b = errorformater.issues[0]) === null || _b === void 0 ? void 0 : _b.message}`,
            });
        }
    }
    catch (error) {
        console.error(error);
    }
}));
userRoute.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const FindUser = yield prisma.users.findFirst({
            where: {
                email,
            },
        });
        if (FindUser) {
            const checkpass = yield bcrypt.compare(password, FindUser.password);
            if (!checkpass) {
                return res.status(400).json({
                    msg: "Entered Password is wrong",
                });
            }
            else {
                const tokens = jwt.sign({
                    token: FindUser.id,
                    email: FindUser.email,
                }, process.env.JWTSECRET, {
                    expiresIn: "1d",
                });
                return res.status(200).json({
                    msg: "Logged In , Enjoy seamless payment!",
                    token: tokens,
                });
            }
        }
        else {
            return res.json({
                msg: `user don't exist!, Kindly check email`,
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Internal Server Error",
        });
    }
}));
//# sourceMappingURL=userLogin.js.map