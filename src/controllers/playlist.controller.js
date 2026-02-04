import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const user=req.user._id;
    if(!name || !description){
        throw new ApiError(400,"either name or decription is missinng")
    }
    let playlistToBe=[]

    const {videos}=req.body;

    if(videos!==undefined)
    {
        if(!Array.isArray(videos) ){
        throw new ApiError(401,"invalid data in videos")
    }
    
          if (
              !videos.every((vid) => mongoose.Types.ObjectId.isValid(vid))
                ) {
              throw new ApiError(400, "Invalid data inside videos");
    }
    playlistToBe=videos
}


    
    const playlist=await Playlist.create({
        name,
        description,
        videos:playlistToBe,
        owner:user
    })
   
    return res.status(200).json(
        new ApiResponse(200,
            playlist,
            "created playlist successsfully"
        )
    )
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400,"Error not exists")
    }
    const playlist=await Playlist.find({
        owner:userId
    })
    if(playlist.length===0){
        return res.status(200).json(
           new ApiResponse(
             200,
            [],
            "empty playlist"
           )
        )
    }
    return res.status(200).
                json(
                    new ApiResponse(
                        200,
                        playlist,
                        "fetched user playlist successfully"
                    )
                )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"plylist not found")
    }
    return res.status(200)
               .json(
                    new ApiResponse(
                        200,
                        playlist,
                        "fetched successfully"
                    )
               )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid id format")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
         throw new ApiError(400," playlist  dosent exist")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(400,"unauthorized access")
    }
    const video=await Video.findById(videoId)
    if(!video){
         throw new ApiError(400," video dosent exist")
    }

    const isPresent = playlist.videos.some(
  (vid) => vid.equals(videoId)
   );

    if(isPresent){
         return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "video already present"
        )
    )
    }

    await playlist.videos.push(videoId)
    await playlist.save()
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "updated successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid id format")
    }

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(400,"Unauthorized access")
    }

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{videos:videoId}
        },
        {
            new:true
        }
    )

   return res.status(200)
                .json(
                    new ApiResponse(2000,
                        updatedPlaylist,
                        "removed video successfully"
                    )
                )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"invalid id format")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(400,"authorization error")
    }
    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        playlist,
                        "deleted successfully"
                    )
                )
    

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"incorrect api format")
    }
    if(!name || !description){
        throw new ApiError(400,"name and description both are required")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(400,"unauthorized user")
    }
    playlist.name=name
    playlist.description=description
    await playlist.save()
    return res.status(200).json(
        new ApiResponse(200,
            playlist,
            "updated successsfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}