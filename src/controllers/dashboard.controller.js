import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const id=req.user._id;
    const video=await Video.find({
        owner:id
    })
    const totalVideos=video.length
    let view=0
    video.forEach((vid)=>{
        view+=vid.views
    })
    const subscribers=await Subscription.find({
        channel:id
    })
    const totalSubscribers=subscribers.length
    const aggregation=await Video.aggregate([
        {$match: {owner:id}},
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"

            }
        },
        {
            $unwind:"$likes"
        },
        {
            $count:"totalLikes"
        }
    ])

    const totalLikes = aggregation.length ? aggregation[0].totalLikes : 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                view,
                totalSubscribers,
                totalLikes
            }
        )
    )
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const id=req.user._id;
    const videos=await Video.find(
        { owner: id },
        { videoFile: 1 }
    )

     return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "channel videos fetched successfully"
        )
    );
    
})

export {getChannelStats,getChannelVideos}