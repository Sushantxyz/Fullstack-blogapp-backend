import express from "express";
import { createpost, deletepost, getpost, getposts, updatepost } from "../Controller_functions/post.js";
import { authentication } from "../Middleware/auth.js";


export const PostRouter = express.Router();

PostRouter.route("/:id").get(authentication, getpost).put(authentication, updatepost).delete(authentication, deletepost);

PostRouter.get("/", authentication, getposts);

PostRouter.post("/create", authentication, createpost);


