import express from "express";
import cors from "cors";
import env from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/user.routes.js";
import healthCheckRouter from "./src/routes/healthCheck.routes.js";
import { errorHandler }
from "./src/middlewares/error.middleware.js"

const app = express();
env.config();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

app.use(express.json({ limit: "16kb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    }),
);
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);

app.use("/api/v1/healthCheck", healthCheckRouter);

app.use(errorHandler)

export { app };