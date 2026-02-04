import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid id format");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "video does not exist");
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("user", "username avatar");

    return res.status(200).json(
        new ApiResponse(200, comments, "fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "comment content is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "video does not exist");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        user: req.user._id
    });

    const populated = await Comment.findById(comment._id).populate("user", "username avatar");

    return res.status(200).json(
        new ApiResponse(200, populated, "comment added successfully")
    );
});

export { getVideoComments, addComment }
