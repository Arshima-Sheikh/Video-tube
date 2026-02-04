import mongoose from "mongoose";
import {Video} from "../models/video.model.js" 
import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    let filter={
    isPublished:true
   }
   if(query){
   filter.$or=[{
        title:{$regex:query , $options:"i"}
   },
   {
        description:{$regex:query, $options:"i"}
   }

]
}

if(userId){
    filter.owner=userId
}

const sortOptions={}
sortOptions[sortBy || "createdAt" ]=sortType==="asc"?1:-1

const videos=await Video.find(filter)
                    .sort(sortOptions)
                    .skip((page - 1) * limit)
                    .limit(Number(limit))
                    .populate("owner", "username avatar")

return res.status(200)
            .json(new ApiResponse(
                200,
                videos,
                "videos fetched successfully"
            ))


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title || !description){
        throw new ApiError(400,"both title and description are mandatory")

    }
    const videoLocalPath=req.file?.path
    if(!videoLocalPath){
        throw new ApiError(400,"video is required")
    }
    const video=await uploadOnCloudinary(videoLocalPath)
    if(!video){
        throw new ApiError(400,"something went wrong while uploading the video")
    }
    const creatingVideo=await Video.create({
        videoFile:video.url,
        title,
        description,
        duration : video.duration,
        owner:req.user._id
    })
    return res.status(200)
              .json(
                new ApiResponse(
                    200,
                    creatingVideo,
                    "video uploaded successfully."
                )
              )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"video id not found")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true }
    ).populate("owner", "username avatar");

    if(!video){
        throw new ApiError(400,"video with associated id is not found")
    }

    try {
      if (req.user && req.user._id) {
        await User.findByIdAndUpdate(req.user._id, { $pull: { watchHistory: video._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { watchHistory: { $each: [video._id], $position: 0 } } });
      }
    } catch (err) {
      console.warn("Failed to update watch history:", err);
    }

    return res.status(200)
            .json(
                new ApiResponse(200,video,"video found successfully.")
            )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description}=req.body;
    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video with associated id is not found")
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401,"Unauthorized user")
    }
    if(!title && !description){
        throw new ApiError(400,"missing field to update either update title or description")
    }
    if(title){
        video.title=title
    }
    if(description){
        video.description=description
    }

    await video.save()

    return res.status(200)
                .json(
                    new ApiResponse(200, video , "updated successfully")
                )



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"video id not found")
    }
    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video with associated id dosent exists")
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401,"Unauthorized user")
    }
    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(
        new ApiResponse(200,{},"video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"video not found")
    }
    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video with associated id not found")
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(401,"Unauthorized user")
    }
    video.isPublished=!video.isPublished
    await video.save()
    return res.status(200).json(
        new ApiResponse(200,video,"updated toggle successfully")
    )
})

export {getAllVideos,publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus}