

export const deletecookie = (Token, res, msg) => {
    res.status(200).cookie(Token, "", {
        expires: new Date(Date.now()),
        sameSite: process.env.NODE_ENV === "Develpoment" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Develpoment" ? false : true,
    }).json({
        success: true,
        message: msg
    })
}
