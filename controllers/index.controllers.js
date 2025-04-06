import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'

export const indexController = async (req, res)=>{

    const { ACCESS_TOKEN } = req.cookies;

    if (!ACCESS_TOKEN) throw new ApiError(401, 'Unauhterized request');

    const decodedToken = jwt.verify(ACCESS_TOKEN, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) throw new ApiError(401, 'token expired');

    const user = await userModel.findById(decodedToken.id).select('-password -refreshToken');

    return res.render('home_page', {chats: null, user});
}