import Post from "../Schema/post.js";
import { ErrorHandler } from "../Middleware/errormiddleware.js";
import { User } from "../Schema/user.js";
import { uploadimage } from "../Utils/cloudinary.js";
import asyncHandler from "../Utils/asyncHandler.js";
import nodeCache from "../Utils/Cache.js";

export const createpost = asyncHandler(async (req, res, next) => {
    const { username } = await User.findById(req.userID, { username: 1 });

    const { title, description, photo, category } = req.body;

    let result;
    result = await uploadimage(photo, username, "Posts");

    const newuser = await Post.create({
        title,
        description,
        photo: { public_id: result.public_id, url: result.url },
        username,
        category,
    });

    nodeCache.flushAll();

    return res.status(200).json({
        success: true,
        message: "Post Created sucessfully !",
        id: newuser._id,
    });
});

export const getposts = asyncHandler(async (req, res, next) => {
    const username = req.query.username;
    const cat = req.query.cat;
    let posts;

    if (username) {
        const userpost = nodeCache.get(`posts/${username}`)
        if (userpost) {
            posts = JSON.parse(userpost)

        } else {
            posts = await Post.find({ username });
            nodeCache.set(`posts/${username}`, JSON.stringify(posts));
        }

    } else if (cat) {
        const catpost = nodeCache.has(`posts/${cat}`)
        if (catpost) {
            const catpost = nodeCache.get(`posts/${cat}`)
            posts = JSON.parse(catpost)

        } else {
            posts = await Post.find({
                category: {
                    $in: [cat],
                },
            });
            nodeCache.set(`posts/${cat}`, JSON.stringify(posts));
        }
    } else {
        const allposts = nodeCache.get(`posts`)
        if (allposts) {
            posts = JSON.parse(allposts)
        } else {
            posts = await Post.find();
            nodeCache.set(`posts`, JSON.stringify(posts));
        }
    }

    res.json({
        success: true,
        posts,
    });
});

export const getpost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) return next(new ErrorHandler("Error while fetching Post...", 500));

    return res.status(200).json({
        success: true,
        message: "Post Fetched sucessfully...",
        postdata: post,
    });
});

export const updatepost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { title, description, photo, category } = req.body;

    await Post.findByIdAndUpdate(
        id,
        {
            title,
            description,
            photo,
            category,
        },
        { new: true }
    );

    nodeCache.flushAll();

    return res
        .status(200)
        .json({ success: true, message: "Post Updated successfully..." });

});

export const deletepost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    await Post.findByIdAndDelete(id);

    nodeCache.flushAll();

    return res
        .status(200)
        .json({ success: true, message: "Post Deleted successfully..." });
});
