let blacklistedTokens = [];

const jwt = require('jsonwebtoken');

const blacklistToken = (tokenId) => {
    blacklistedTokens.push(tokenId);
};

const isTokenBlacklisted = (tokenId) => {
    return blacklistedTokens.includes(tokenId);
};

const verifyToken = (token) => {
    try {
        const jwtKey = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, jwtKey); // Verify the token using your secret key
        const tokenId = decoded.jti; // Get the `jti` from the token

        // Check if the token is blacklisted
        if (isTokenBlacklisted(tokenId)) {
            throw new Error('Token has been invalidated');
        }

        return decoded;
    } catch (error) {
        throw error; // Throw the original error
    }
};

module.exports = { blacklistedTokens,blacklistToken, isTokenBlacklisted,verifyToken };