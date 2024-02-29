const asyncHandler = (func) => {
    return (req, res, next) => func(req, res, next).catch(next)
}

export default asyncHandler;