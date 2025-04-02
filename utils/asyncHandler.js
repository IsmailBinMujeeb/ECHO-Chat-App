const asyncHandler = fn => async (req, res, next) => {

    try {
        await fn(req, res, next)
    } catch (error) {
        
        return res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error', success: false });
    }
}

export default asyncHandler;