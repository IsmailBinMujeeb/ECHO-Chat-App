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
        $or: [{ userhandle }, { email }]
    });

    if (isUserExist) throw new ApiError(409, 'user with this email or userhandle already exist');

    const user = await userModel.create({
        userhandle,
        email,
        password,
    });

    const { ACCESS_TOKEN, REFRESH_TOKEN } = user.generateAuthTokens();

    res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, { httpOnly: true, secure: true, maxAge: 9999999999 });
    res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, { httpOnly: true, secure: true, maxAge: 99999999999 });

    res.redirect('/');

}

export const signinController = (req, res) => {

    return res.render('login_page');
}

export const signinPostController = async (req, res) => {

    const { userhandle, password } = req.body;

    if (!userhandle || !password) throw new ApiError(400, 'missing cridentials');

    const user = await userModel.findOne({userhandle});

    if (!user) throw new ApiError(409, 'Invalid Cridentials');

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) throw new ApiError(400, 'Invalid Cridentials');

    const { ACCESS_TOKEN, REFRESH_TOKEN } = user.generateAuthTokens();

    res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, { httpOnly: true, secure: true, maxAge: 99999999 });
    res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, { httpOnly: true, secure: true, maxAge: 999999999 });

    return res.redirect('/');
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

    res.redirect('/user/signin');
}

export const refreshAccessTokenController = async (req, res) => {

    const { REFRESH_TOKEN: incommingRefreshToken } = req.cookies;

    if (!incommingRefreshToken) throw new ApiError(401, 'unautherized user');

    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await userModel.findById(decodedToken?.id);

    if (!user) throw new ApiError(401, 'invalid refresh token');

    if (incommingRefreshToken !== user?.refreshToken) throw new ApiError(401, 'refresh token expired or used');

    const { ACCESS_TOKEN, REFRESH_TOKEN } = user.generateAuthTokens();

    res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, { httpOnly: true, secure: true, maxAge: 99999999999 });
    res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, { httpOnly: true, secure: true, maxAge: 999999999999 });

    res.status(200).json(new ApiResponse(200, {}, 'tokens regenereated'));

}