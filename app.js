import express from "express";
import cors from 'cors';
import env from 'dotenv'


const app = express();
env.config()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"));

export { app }