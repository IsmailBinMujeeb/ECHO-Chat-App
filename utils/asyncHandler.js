import ApiResponse from "./ApiResponse"

const asyncHandler = fn => async (req, res, next) => {

    try {
        await fn(req, res, next)
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, error.message || 'internal server error', false));
    }
}

export default asyncHandler;