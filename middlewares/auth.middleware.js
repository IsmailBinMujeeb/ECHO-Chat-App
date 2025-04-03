import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const authenticate = async (req, res, next) => {

    const { ACCESS_TOKEN } =  req.cookies;

    if (!ACCESS_TOKEN) return res.redirect('/user/signin')

    const decodedAccessToken = jwt.verify(ACCESS_TOKEN, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel.findById(decodedAccessToken?.id).select("-password -refreshToken");

    if (!user) throw new ApiError(401, 'Unauthorized request');

    req.user = user;
    next();
}