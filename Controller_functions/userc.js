import jwt from "jsonwebtoken";
import { User } from "../Schema/user.js";
import bcrypt from "bcrypt";
import CreateCookie from "../Middleware/cookies.js";
import { ErrorHandler } from "../Middleware/errormiddleware.js";
import { deletecookie } from "../Middleware/deletecookie.js";

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
2
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
        next(new ErrorHandler("Error while fetching user...",403));
    }
};

export const updateuser = async (req, res, next) => {
    try {
        const { Token } = req.cookies;

        if (!Token)
            return next(new ErrorHandler("Error while fetching profile..."));

        const userid = jwt.decode(Token, process.env.SECRET_CODE);

        const { username, password, profilepicture } = req.body;
        const hasspassword = await bcrypt.hash(password, 10);
        req.body.password = hasspassword;

        //userid._id or userid both works
        const user = await User.findByIdAndUpdate(
            userid._id,
            {
                // $set: req.body
                username,
                password: hasspassword,
                profilepicture,
            },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Updated successfully..." });
    } catch (error) {
        next(new ErrorHandler("Unable to update..."));
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
