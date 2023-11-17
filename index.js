// const express = require('express')

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserRouter } from "./Routes/UserRoute.js";
import cookieParser from "cookie-parser";
import errormiddleware from "./Middleware/errormiddleware.js";
import { PostRouter } from "./Routes/PostRoute.js";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const server = express();

// Use the fileURLToPath function to get the directory name
server.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


server.use("/images", express.static(path.join(__dirname, "/images")));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});

dotenv.config();
server.use(express.json());
server.use(cookieParser());
server.use("/api/v-1/", UserRouter);
server.use("/api/v-1/post", PostRouter);
server.use(errormiddleware);

const upload = multer({ storage: storage });
server.post("/api/v-1/upload", upload.single("file"), (req, res) => {
    res.status(200).json("File has been uploaded");
});



//DataBase
mongoose.connect(process.env.MONGO_URI,
    { dbName: "Todo_backend_latest" })
    .then(() => console.log("Database Connected Succesfully!!"))
    .catch(() => console.log("Error while connecting Database"))

server.listen("3000", (req, res) => {
    console.log("Server is running...");
})