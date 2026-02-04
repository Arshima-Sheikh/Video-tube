import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Comment } from "../models/comment.model.js";
import { getVideoComments,addComment } from "../controllers/comment.controller.js";
const router=Router()

router.route("/get-comments/:videoId").get(getVideoComments)

router.route("/add/:videoId").post(verifyJWT,addComment)



export default router