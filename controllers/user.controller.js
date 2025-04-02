import ApiError from "../utils/ApiError.js";
import userModel from "../models/user.model.js"
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

export const signupController = (req, res) => {

    return res.render('register_page');
}

export const signupPostController = async (req, res) => {

    const { userhandle, email, password } = req.body;

    if (!userhandle || !email || !password) throw new ApiError(400, 'missing credentials');

    const isUserExist = await userModel.findOne({
        $or: [{ userModel }, { email }]
    });

    if (isUserExist) throw new ApiError(409, 'message user with this email or userhandle already exist');

    const user = await userModel.create({
        userhandle,
        email,
        password,
    });

    const { ACCESS_TOKEN, REFRESH_TOKEN } = user.generateAuthTokens();

    const createdUser = await userModel.findById(user._id).select("-password -refreshToken");

    res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, {
        httpOnly: true,
        secure: true,
    })

    res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, {
        httpOnly: true,
        secure: true,
    })

    res.status(200).json(new ApiResponse(200, createdUser, 'success'));

}

export const signinController = (req, res) => {

    return res.render('login_page');
}

export const signinPostController = async (req, res) => {

    const { userhandle, email, password } = req.body;

    if (!(userhandle || email) || !password) throw new ApiError(400, 'missing cridentials');

    const user = await userModel.findOne({
        $or: [{ userhandle }, { email }]
    });

    if (!user) throw new ApiError(409, 'Invalid Cridentials');

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) throw new ApiError(400, 'Invalid Cridentials');

    const { ACCESS_TOKEN, REFRESH_TOKEN } = user.generateAuthTokens();

    const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken");

    res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, { httpOnly: true, secure: true });
    res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, { httpOnly: true, secure: true });

    return res.status(200).json(new ApiResponse(200, loggedInUser, 'success'));
}

export const logoutPostController = async (req, res) => {

    await userModel.findOneAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        })

    res.clearCookie('ACCESS_TOKEN', { httpOnly: true, secure: true });
    res.clearCookie('REFRESH_TOKEN', { httpOnly: true, secure: true });

    res.status(200).json(new ApiResponse(200, {}, 'user logged out'))
}

export const refreshAccessTokenController = async (req, res) => {

    const { REFRESH_TOKEN: incommingRefreshToken } = req.cookies;

    if (!incommingRefreshToken) throw new ApiError(401, 'unautherized user');

    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await userModel.findById(decodedToken?.id);

    if (!user) throw new ApiError(401, 'invalid refresh token');

    if (incommingRefreshToken !== user?.refreshToken) throw new ApiError(401, 'refresh token expired or used');

    const { ACCESS_TOKEN, REFRESH_TOKEN } = user.generateAuthTokens();

    res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, { httpOnly: true, secure: true });
    res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, { httpOnly: true, secure: true });

    res.status(200).json(new ApiResponse(200, {}, 'tokens regenereated'));

}