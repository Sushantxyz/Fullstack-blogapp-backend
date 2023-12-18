
import mongoose from "mongoose";

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String,
        require: true,
        unique: true
    },
    photo: {
        public_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        },
    },
    username: {
        type: String,
        require: true,
    },
    category: {
        type: Array,
        require: false
    }
}, { timestamps: true })

const Post = mongoose.model("POST", PostSchema)

export default Post;