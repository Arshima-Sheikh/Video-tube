import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

app.use(express.static("public"));

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import healthRouter from "./routes/healthcheck.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import commentRouter from "./routes/comment.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/playlist", playlistRouter);
app.use("/like", likeRouter);
app.use("/healthcheck", healthRouter);
app.use("/dashboard", dashboardRouter);
app.use("/comment", commentRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ status, message });
});

export { app };