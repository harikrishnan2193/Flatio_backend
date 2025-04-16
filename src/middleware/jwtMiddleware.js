const jwt = require('jsonwebtoken')

const jwtMiddleWare = (req, res, next) => {
    console.log('inside jwt Middleware');

    const token = req.headers['authorization'].split(' ')[1]
    console.log(token);

    try {
        const jwtResponse = jwt.verify(token, "$ecret$uperAppkey12345")
        console.log(jwtResponse);
        req.payload = jwtResponse.userId
        next()

    } catch (err) {
        res.status(401).json('Authorization failed.....you have no access. Login again')
    }


}

module.exports = jwtMiddleWare