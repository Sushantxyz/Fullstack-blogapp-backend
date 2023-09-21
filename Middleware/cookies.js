
const CreateCookie = (res, token) => {
    res.cookie("Token", token, {
        httpsonly: true,
        maxage: 1000 * 60 * 15,
        sameSite: process.env.NODE_ENV === "Develpoment" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Develpoment" ? false : true,
    }).json({
        success: true,
        message: "Logged in sucessfully"
    });

}

export default CreateCookie;