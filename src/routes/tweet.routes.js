import mongoose from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet,getUserTweets,updateTweet,deleteTweet,getAllTweets } from "../controllers/tweet.controller.js";
import { Router } from "express";

const router=Router();

router.use(verifyJWT);

router.route("/create-tweet").post(createTweet)

router.route("/get-user-tweets").get(getUserTweets)

router.route("/get-all-tweets").get(getAllTweets)

router.route("/update-tweet/:tweetId").patch(updateTweet)

router.route("/delete-tweet/:tweetId").delete(deleteTweet)

export default router;