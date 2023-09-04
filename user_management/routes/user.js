import express from "express";
import {
   createUser,
   deleteUser,
   getUser,
   getUsers,
   updateUser,
} from "../controller/user.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
