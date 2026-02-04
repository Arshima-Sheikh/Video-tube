import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedTweets
}
from "../controllers/like.controller.js"

const router=Router()

router.use(verifyJWT)

router.route("/video-like/:videoId").patch(toggleVideoLike)

router.route("/comment-like/:commentId").patch(toggleCommentLike)

router.route("/tweet-like/:tweetId").patch(toggleTweetLike)

router.route("/get-liked-videos").get(getLikedVideos)

router.route("/get-liked-tweets").get(getLikedTweets)

export default router;