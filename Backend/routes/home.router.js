import { Router } from "express";
import { indexController } from "../controllers/index.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js"

const router = Router();

router.get('/', asyncHandler(authenticate), asyncHandler(indexController));

export default router;