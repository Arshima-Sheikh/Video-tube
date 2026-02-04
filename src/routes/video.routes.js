import { Router } from "express";
import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  updateVideo,
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";

const router = Router();

router.get("/", getAllVideos);
router.get("/get-video-by-id/:videoId", optionalJWT, getVideoById);

router.use(verifyJWT);

router.post("/publish", upload.single("video"), publishAVideo);
router.patch("/update/:videoId", updateVideo);
router.delete("/delete/:videoId", deleteVideo);
router.patch("/toggle/:videoId", togglePublishStatus);

export default router;
