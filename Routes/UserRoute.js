import express from "express";
import {  login, logout, register, getuser, updateuser, deleteuser } from "../Controller_functions/userc.js";
import { authentication } from "../Middleware/auth.js";

export const UserRouter = express.Router();


UserRouter.post("/login", login);

UserRouter.post("/register", register);

UserRouter.post("/logout", logout);

UserRouter.get("/getuser", authentication, getuser);

UserRouter.put("/update", authentication, updateuser);

UserRouter.delete("/delete", authentication, deleteuser);



