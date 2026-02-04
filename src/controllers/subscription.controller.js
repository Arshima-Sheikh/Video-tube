import mongoose from "mongoose";
import {Subscription} from "../models/subscription.model.js"
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400,"channel cannot be found")
    }
    const channel=await User.findById(channelId)

    if(!channel){
        throw new ApiError(404,"channel cannot be found")
    }
    const existingSubscriber=await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })

    if(existingSubscriber){
        await Subscription.findByIdAndDelete(existingSubscriber._id)
        return res.status(200)
                  .json(
                    new ApiResponse(200,{},"done")
                  )
    }
    await Subscription.create({
         subscriber:req.user._id,
        channel:channelId
    })
    return  res.status(200)
                  .json(
                    new ApiResponse(200,{},"done")
                  )

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(404,"channel cannot be found")
    }

    const ischannel=await User.findById(channelId)
    if(!ischannel){
        throw new ApiError(404,"channel cannot be found")
    }
    const subscribers=await Subscription.find({
        channel:channelId
    })
    const size=subscribers.length
    return res.status(200)
              .json(new ApiResponse(
                200,
                size,
                "fetched subscribers succesfully"
              ))

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(404,"user doent exits")
    }
    const user=await User.findById(subscriberId)

    if(!user){
        throw new ApiError(404,"user doent exits")
    }
    const subscribedChannel=await Subscription.find({
        subscriber:subscriberId
    })
    return res.status(200).
                json(
                    new ApiResponse(200,
                        subscribedChannel,
                        "fetchd successfully"
                    )
                )

})

export {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}