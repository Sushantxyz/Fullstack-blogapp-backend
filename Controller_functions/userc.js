import jwt from "jsonwebtoken";
import { User } from "../Schema/user.js";
import Post from "../Schema/post.js";
import bcrypt from "bcrypt";
import CreateCookie from "../Utils/cookies.js";
import { ErrorHandler } from "../Middleware/errormiddleware.js";
import { deletecookie } from "../Utils/deletecookie.js";
import { uploadimage } from "../Utils/cloudinary.js";
import asyncHandler from "../Utils/asyncHandler.js";
import nodeCache from "../Utils/Cache.js";

export const login = asyncHandler(async (req, res, next) => {
    if (!req.userID) {
        const { username, password } = req.body;

        const getusername = await User.findOne({ username }).select("+password");

        if (!getusername) return next(new ErrorHandler("User don't exist !", 404));

        const validatepass = await bcrypt.compare(password, getusername.password);

        if (!validatepass)
            return next(new ErrorHandler("Invalid Email or Password !", 400));

        const token = jwt.sign({ _id: getusername._id }, process.env.SECRET_CODE);

        CreateCookie(res, token);
    } else {
        next(new ErrorHandler("Already logged in !", 400)); //
    }
});

export const register = asyncHandler(async (req, res, next) => {
    if (!req.userID) {
        const { username, email, password } = req.body;

        const getuser = await User.findOne({ email });

        if (getuser) return next(new ErrorHandler("User Already Exist !", 400));

        const hasspassword = await bcrypt.hash(password, 10);

        const newuser = await User.create({
            username,
            email,
            password: hasspassword,
            profilepicture: "",
        });
        newuser.save();

        const tokenreg = jwt.sign({ _id: newuser._id }, process.env.SECRET_CODE);

        CreateCookie(res, tokenreg);
    } else {
        next(new ErrorHandler("Already logged in !", 400));
    }
});

export const logout = asyncHandler(async (req, res, next) => {
    deletecookie("Token", res, "Logout successfully !");
    nodeCache.flushAll();
});

export const getuser = asyncHandler(async (req, res, next) => {
    const check = nodeCache.has("user");

    let user;
    if (check) {
        const cachedUser = nodeCache.get("user");
        user = JSON.parse(cachedUser);
    } else {
        user = await User.findOne({ _id: req.userID }, { password: 0 });
        nodeCache.set("user", JSON.stringify(user));
    }

    if (user) {
        return res.status(200).json({ success: true, _user: user });
    } else {
        return next(new ErrorHandler("Error while fetching data", 500));
    }
});

export const updateuser = asyncHandler(async (req, res, next) => {
    if (!req.userID)
        return next(new ErrorHandler("Error while fetching profile"));

    const userinfo = await User.findOne({ _id: req.userID }, { username: 1 });

    const oldusername = userinfo.username;

    const { updatedusername, password, profilepicture } = req.body;

    const hasspassword = await bcrypt.hash(password, 10);

    const checkuser = await User.findOne({ username: updatedusername });

    if (checkuser) {
        if (checkuser.username !== oldusername) {
            return next(new ErrorHandler("Username Already Exist", 400));
        }
    }

    let result;

    result = await uploadimage(profilepicture, updatedusername, "User_Avatar");

    await User.findByIdAndUpdate(
        req.userID,
        {
            $set: {
                username: updatedusername,
                password: hasspassword,
                profilepicture: { public_id: result.public_id, url: result.url },
            },
        },
        { new: true }
    );

    await Post.updateMany(
        { username: oldusername },
        { $set: { username: updatedusername } },
        { new: true }
    );

    nodeCache.flushAll();

    res.status(200).json({ success: true, message: "Updated successfully !" });
});

export const deleteuser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete({ _id: req.user._id });

    deletecookie("Token", res, "User deleted !");
});
