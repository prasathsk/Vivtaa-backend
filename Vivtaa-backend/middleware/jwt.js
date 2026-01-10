const {verifyToken} = require('../components/jwtTokenDetails');


const authenticateToken = (req, res, next) => {

    //get token
    const getToken = req.header('Authorization')?.split(' ')[1];
    if(!getToken) {
        return res.status(403).json({
            status:403,
            message:'Token is required'
        });
    }

    // verify the token
    try {
        const decoded = verifyToken(getToken);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: error.message
        });
    }
};

module.exports = {authenticateToken}