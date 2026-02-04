import mongoose from "mongoose";
import { Router } from "express";
import { toggleSubscription,getSubscribedChannels,getUserChannelSubscribers } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.route("/subscribe/:channelId").patch(toggleSubscription)

router.route("/get-subscribed-channel/:subscriberId").get(getSubscribedChannels)

router.route("/get-subscribers/:channelId").get(getUserChannelSubscribers)
export default router