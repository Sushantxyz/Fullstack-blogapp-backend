

export const authentication = (req, res, next) => {

    const { Token } = req.cookies;
    if (Token) {
        next();
    } else {
        res.status(404).json({
            success: false,
            message: "Login first..."
        });
    }
}

