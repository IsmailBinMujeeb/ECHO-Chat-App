import { Router } from "express";
import { getMessageController } from "../../../controllers/api/v1/message.controller.js";
import asyncHandler from "../../../utils/asyncHandler.js";

const router = Router();

router.get("/v1/messages/:chatId", asyncHandler(getMessageController));

export default router;