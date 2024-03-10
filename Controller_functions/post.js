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
    const limit = req.query.limit || 6
    const skip = req.query.skip
    let posts;
    let count;

    if (username) {
        if (limit && skip) {
            const userpost = nodeCache.get(`posts/${username}/${skip}/${limit}`);

            if (userpost) {
                posts = JSON.parse(userpost);
            } else {
                posts = await Post.find({ username })
                    .skip(Number(skip))
                    .limit(Number(limit));
                nodeCache.set(`posts/${username}`, JSON.stringify(posts));
            }
        } else {
            const userpost = nodeCache.get(`posts/${username}/default`);
            if (userpost) {
                posts = JSON.parse(userpost);
            } else {
                posts = await Post.find({ username }).limit(Number(limit));
                nodeCache.set(`posts/${username}/default`, JSON.stringify(posts));
            }
        }

        const cacheUserPostCount = nodeCache.get(`count/${username}`);

        if (cacheUserPostCount) {
            count = JSON.parse(cacheUserPostCount);
        } else {
            const userPostCount = await Post.find({ username }).countDocuments();
            count = userPostCount;
            nodeCache.set(`count/${username}`, JSON.stringify(userPostCount));
        }

    } else if (cat) {

        if (limit && skip) {
            const catpost = nodeCache.get(`posts/${cat}/${skip}/${limit}`);
            if (catpost) {
                posts = JSON.parse(catpost);
            } else {
                posts = await Post.find({
                    category: {
                        $in: [cat],
                    },
                })
                    .skip(Number(skip))
                    .limit(Number(limit));
                nodeCache.set(`posts/${cat}`, JSON.stringify(posts));
            }
        } else {
            const catpost = nodeCache.get(`posts/${cat}/default`);
            if (catpost) {
                posts = JSON.parse(catpost);
            } else {
                posts = await Post.find({
                    category: {
                        $in: [cat],
                    },
                }).limit(Number(limit));
                nodeCache.set(`posts/${cat}/default`, JSON.stringify(posts));
            }
        }
        const cacheCatPostCount = nodeCache.get(`count/${cat}`);
        if (cacheCatPostCount) {
            count = JSON.parse(cacheCatPostCount);

        } else {
            const userCatPostCount = await Post.find({
                category: {
                    $in: [cat],
                },
            }).countDocuments();
            count = userCatPostCount;

            nodeCache.set(`count/${cat}`, JSON.stringify(userCatPostCount));
        }

    } else {
        if (limit && skip) {
            const allposts = nodeCache.get(`posts/?${limit}&${skip}`);
            if (allposts) {
                posts = JSON.parse(allposts);

            } else {
                posts = await Post.find().skip(Number(skip)).limit(Number(limit));
                nodeCache.set(`posts/?${limit}&${skip}`, JSON.stringify(posts));
            }

        } else {
            const allposts = nodeCache.get(`posts/default`);
            if (allposts) {
                posts = JSON.parse(allposts);
            } else {
                posts = await Post.find().limit(Number(limit));
                nodeCache.set(`posts/default`, JSON.stringify(posts));
            }
        }
        const cachePostCount = nodeCache.get(`count/default`);

        if (cachePostCount) {
            count = JSON.parse(cachePostCount);
        } else {
            const allPostsCount = await Post.find().countDocuments();
            count = allPostsCount;
            nodeCache.set(`count/default`, JSON.stringify(allPostsCount));
        }
    }
    res.json({
        success: true,
        posts,
        count,
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