import mongoose from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const user=req.user._id;
    if(!user){
        throw new ApiError(404,"user not found")
    }
    const {content}=req.body
    if(!content){
        throw new ApiError(400,"content is must for tweets")
    }
    const tweet=await Tweet.create({
        content,
        owner:user
    })

    const populated = await Tweet.findById(tweet._id).populate("owner", "username avatar");

    return res.status(200)
              .json(
                new ApiResponse(
                    200,
                    populated,
                    "tweet created successfully"
                )
              )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const user=req.user._id
    if(!user){
        throw new ApiError(400,"user doesnt exists")
    }
    const tweets=await Tweet.find({
        owner:user
    }).populate("owner", "username avatar")
    return res.status(200)
              .json(
                new ApiResponse(200,
                    tweets,
                    "tweets fetched successfully"
                )
              )
})

const getAllTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.find({})
        .sort({ createdAt: -1 })
        .populate("owner", "username avatar");

    return res.status(200)
        .json(new ApiResponse(200, tweets, "all tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params
    const {content}=req.body

    if(!tweetId){
        throw new ApiError(400,"tweet id is  required")
    }
    const findTweet=await Tweet.findById(tweetId)
    if(!findTweet){
        throw new ApiError(400,"tweet dosent exists")
    }
    if(!findTweet.owner.equals(req.user._id)){
        throw new ApiError(401,"unauthorized access")
    }
    if(!content){
        throw new ApiError(400,"content is missing")
    }
    findTweet.content=content
    await findTweet.save()
    return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        findTweet,
                        "updated successfully"
                    )
                )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}=req.params

    if(!tweetId){
        throw new ApiError(400,"tweet id is missing")
    }
    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400,"tweet with associated id cannot be found")
    }
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(401,"unauthorized access")
    }
    await Tweet.findByIdAndDelete(tweetId)
    return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "deleted successfully"
                )
            )
})

export {createTweet,getUserTweets,updateTweet,deleteTweet,getAllTweets}