import { Router } from "express";
import { signupController, signupPostController, signinController, signinPostController, logoutPostController, refreshAccessTokenController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get('/signup', signupController);
router.post('/signup', asyncHandler(signupPostController))

router.get('/signin', signinController);
router.post('/signin', asyncHandler(signinPostController));

router.post('/logout', asyncHandler(authenticate), asyncHandler(logoutPostController));
router.post('/refresh-access-token', asyncHandler(refreshAccessTokenController));

export default router;