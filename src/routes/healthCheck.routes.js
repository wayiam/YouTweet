import { Router } from "express";

import { healthCheck } from "../controllers/healthCheck.controllers.js";

const routers = Router();

routers.route("/").get(healthCheck);

export default routers;
