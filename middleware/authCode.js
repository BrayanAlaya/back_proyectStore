const jwt = require("../services/jwt")

module.exports = (req,res,next) => {

    let token = req.headers.authorization;

    let user = jwt.data(token, process.env.JWTPASSWORD_AUTHCODE)

    console.log(token)

    if (user.email) {
        req.user = user
        next()
    } else{
        return res.send({
            status: 400,
            message: "Didn't pass authentication"
        })
    }

}
