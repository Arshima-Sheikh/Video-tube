import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import {Comment} from "../models/comment.model.js"
import {Like} from "../models/like.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid video id")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
    const isLiked=await Like.findOne(
        {
            video:videoId,
            likedBy:req.user._id
        }
    )
    if(!isLiked){
        const like=await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
        return res.status(200).json(
            new ApiResponse(
                200,
                like,
                "liked successfully"
            )
        )
    }
    await Like.findByIdAndDelete(isLiked._id)

     return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "removed like successfully"
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"invalid comment id")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"comment does not exists")
    }
    const commentLiked=await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })
    if(commentLiked){
        await Like.findByIdAndDelete(commentLiked._id)
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "unliked"
            )
        )
    }
    const liking=await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })
     return res.status(200).json(
            new ApiResponse(
                200,
                liking,
                "liked"
            )
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"tweet not found")
    }
    const tweetExists=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })
    if(!tweetExists){
       const creating=await Like.create({
             tweet:tweetId,
        likedBy:req.user._id
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                creating,
                "liked"

            )
        )
    }
    await Like.findByIdAndDelete(tweetExists._id)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "unliked"
        )
    )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.user._id)){
        throw new ApiError(400,"invalid id format")
    }
    const videos =await Like.find({
        likedBy:req.user._id,
        video:{$ne:null}
    }).populate("video")
    if(videos.length===0){
       return res.status(404).json(new ApiResponse(404,"no liked videos found"))
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "fetched successfully"
        )
    )
})

const getLikedTweets = asyncHandler(async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.user._id)){
        throw new ApiError(400,"invalid id format")
    }
    const likes = await Like.find({
        likedBy: req.user._id,
        tweet: { $ne: null }
    }).populate({
        path: "tweet",
        populate: { path: "owner", select: "username avatar" }
    });

    if(!likes.length){
        return res.status(200).json(new ApiResponse(200, [], "no liked tweets"))
    }

    const tweets = likes.map(l => l.tweet);
    return res.status(200).json(new ApiResponse(200, tweets, "fetched liked tweets"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedTweets
}