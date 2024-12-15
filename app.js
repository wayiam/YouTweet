import express from "express";
import cors from "cors";
import env from "dotenv";
import cookieParser from "cookie-parser";

//Import the routes
import userRouter from "./src/routes/user.routes.js";
import commentRouter from "./src/routes/comment.routes.js";
import dashboardRouter from "./src/routes/dashboard.routes.js";
import healthCheckRouter from "./src/routes/healthCheck.routes.js";
import likesRouter from "./src/routes/like.routes.js";
import playlistRouter from "./src/routes/playlist.routes.js";
import subscriptionsRouter from "./src/routes/subscription.js";
import tweetRouter from "/src/routes/tweets.routes.js";
import videosRouter from "./src/routes/videos.routes.js";

//Error Handler import
import { errorHandler } from "./src/middlewares/error.middleware.js";

//app initialization
const app = express();

//load env variables
env.config();

// Middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

//Body parser which prevents larger requests
app.use(express.json({ limit: "16kb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

//load static files
app.use(express.static("public"));

//parsing cookies
app.use(cookieParser());

//Define routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionsRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/videos", videosRouter);
app.use("/api/v1/healthCheck", healthCheckRouter);

//Global Error Handler
app.use(errorHandler);

export { app };