import jwt from "jsonwebtoken";
import { User } from "../Schema/user.js";
import Post from "../Schema/post.js"
import bcrypt from "bcrypt";
import CreateCookie from "../Utils/cookies.js";
import { ErrorHandler } from "../Middleware/errormiddleware.js";
import { deletecookie } from "../Utils/deletecookie.js";
import { uploadimage } from "../Utils/cloudinary.js";

export const login = async (req, res, next) => {
    try {

        const { Token } = req.cookies;
        if (!Token) {
            const { username, password } = req.body;

            const getusername = await User.findOne({ username }).select("+password");

            if (!getusername) return next(new ErrorHandler("User don't exist...", 404));

            const validatepass = await bcrypt.compare(password, getusername.password);

            if (!validatepass)
                return next(new ErrorHandler("Invalid Email or Password", 400));

            const token = jwt.sign({ _id: getusername._id }, process.env.SECRET_CODE);

            CreateCookie(res, token);
        }
        else {
            next(new ErrorHandler("Already logged in...", 400));//

        }

    } catch (error) {
        next(new ErrorHandler("Error logging user... "));
    }
};

export const register = async (req, res, next) => {
    try {
        const { Token } = req.cookies;
        if (!Token) {
            const { username, email, password } = req.body;

            const getuser = await User.findOne({ email });

            if (getuser) return next(new ErrorHandler("User Already Exist", 400));

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
        }
        else {
            next(new ErrorHandler("Already logged in...", 400));//
        }
    } catch (error) {
        next(new ErrorHandler("Error registering user... "));
    }
};

export const logout = async (req, res, next) => {
    const { Token } = req.cookies;
    if (Token) {
        deletecookie("Token", res, "Logout successfully ...");
    } else {
        next(new ErrorHandler("Login first... "));
    }
};

export const home = async (req, res, next) => {
    const { Token } = req.cookies;
    if (Token) {
        return res.json({
            success: true,
            message: "welcome to home page...",
        });
    }

    return res.json({
        success: false,
        message: "Login First...",
    });
};

export const getuser = async (req, res, next) => {
    try {
        const { Token } = req.cookies;

        if (Token) {

            const userid = jwt.decode(Token, process.env.SECRET_CODE);

            //can add if else to check if the id are same...

            const user = await User.findOne({ _id: userid });

            const { password, ...data } = user._doc;

            if (user) return res.status(200).json({ success: true, _user: data });

            else return next(new ErrorHandler("Error while fetching data...", 500));

        } else {
            return next(new ErrorHandler("Login first ...", 201));
        }
    } catch (error) {
        next(new ErrorHandler("Error while fetching user...", 403));
    }
};

export const updateuser = async (req, res, next) => {
    try {
        const { Token } = req.cookies;

        if (!Token)
            return next(new ErrorHandler("Error while fetching profile..."));

        const userid = jwt.decode(Token, process.env.SECRET_CODE);

        const userinfo = await User.findOne({ _id: userid });

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

        try {
            result = await uploadimage(profilepicture, updatedusername, "User_Avatar");

        } catch (error) {
            next(error);
        }

        const user = await User.findByIdAndUpdate(
            { _id: userid._id },
            {
                $set: {
                    username: updatedusername,
                    password: hasspassword,
                    profilepicture: { public_id: result.public_id, url: result.url },
                }
            },
            { new: true }
        );

        const tasks = await Post.updateMany(
            { username: oldusername },
            { $set: { username: updatedusername } },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Updated successfully..." });
    } catch (error) {
        next(new ErrorHandler(`Unable to update. Error: ${error.message}`));
    }
};

export const deleteuser = async (req, res, next) => {
    try {
        const { Token } = req.cookies;

        if (!Token) return next(new ErrorHandler("Login first...", 404));

        const userid = jwt.decode(Token, process.env.SECRET_CODE);

        const user = await User.findByIdAndDelete({ _id: userid._id });

        deletecookie("Token", res, "User deleted ...");
    } catch (error) {
        next(new ErrorHandler("Unable to delete user..."));
    }
};
