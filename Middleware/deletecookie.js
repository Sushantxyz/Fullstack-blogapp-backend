

export const deletecookie = (Token,res,msg) =>{
    res.status(200).cookie(Token, "", {
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: msg
    })
}
