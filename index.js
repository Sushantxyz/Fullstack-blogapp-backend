
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { UserRouter } from "./Routes/UserRoute.js";
import cookieParser from "cookie-parser";
import errormiddleware from "./Middleware/errormiddleware.js";
import { PostRouter } from "./Routes/PostRoute.js";
import cors from "cors";


const server = express();

// Use the fileURLToPath function to get the directory name

dotenv.config();
server.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL1],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))

server.use(express.json({ limit: "50mb" }));
server.use(express.urlencoded({ extended: "true", limit: "50mb" }));
server.use(cookieParser());
server.use("/api/v-1/", UserRouter);
server.use("/api/v-1/post", PostRouter);
server.use(errormiddleware);

//DataBase
mongoose.connect(process.env.MONGO_URI,
    { dbName: "Todo_backend_latest" })
    .then(() => console.log("Database Connected Succesfully!!"))
    .catch(() => console.log("Error while connecting Database"))

server.listen(process.env.PORT, (req, res) => {
    console.log("Server is running...");
})