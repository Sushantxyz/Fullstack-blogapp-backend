import Post from "../Schema/post.js"
import { ErrorHandler } from "../Middleware/errormiddleware.js";
import { User } from "../Schema/user.js";
import jwt from "jsonwebtoken";



export const createpost = async (req, res, next) => {
    try {
        const { Token } = req.cookies;
        const userid = jwt.decode(Token, process.env.SECRET_CODE);

        //can add if else to check if the id are same...

        const user = await User.findById({ _id: userid._id });

        const { username, ...data } = user._doc;

        const { title, description, photo, category } = req.body;

        const newuser = await Post.create({
            title, description, photo, username, category
        })

        return res.status(200).json({ success: true, message: "Post Created sucessfully...", id: newuser._id });

    } catch (error) {
        next(error);
    }
}

export const getposts = async (req, res, next) => {
    try {
        const username = req.query.username;
        const cat = req.query.cat;

        let posts;
        if (username) {
            posts = await Post.find({ username });
        }
        else if (cat) {
            posts = await Post.find({
                category: {
                    $in: [cat],
                },
            });
        }
        else {
            posts = await Post.find();
        }

        res.json({
            success: true,
            posts
        })

    } catch (error) {
        console.log(2);
        next(error)
    }
}

export const getpost = async (req, res, next) => {
    try {

        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) return next(new ErrorHandler("Error while fetching Post...", 500));

        return res.status(200).json({ success: true, message: "Post Fetched sucessfully...", postdata: post });

        // if (user) return res.status(200).json({ success: true, _user: data });

        // else return next(new ErrorHandler("Error while fetching data...", 500));

    } catch (error) {
        next(error)
    }
}

export const updatepost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { title, description, photo, category } = req.body;

        const post = await Post.findByIdAndUpdate(id, {
            title, description, photo, category
        }, { new: true });

        return res.status(200).json({ success: true, message: "Post Updated successfully..." });

    } catch (error) {
        next(error)
    }
}

export const deletepost = async (req, res, next) => {
    try {

        const { id } = req.params;

        const post = await Post.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Post Deleted successfully..." });

    } catch (error) {
        next(error)
    }
}


