import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import {authenticate} from "../middlewares/auth.middleware.js"

const router = Router();

router.get('/:recieverHandle', asyncHandler(authenticate), asyncHandler(chatController));

export default router;