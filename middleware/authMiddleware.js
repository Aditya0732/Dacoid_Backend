const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secret = 'secretpassword';
const secret1 = 'secretpassword2'; 

const authenticate = async (req, res, next) => {
    try {
        // Check if Authorization header is present
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is missing' });
        }

        // Extract token from Authorization header
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access token is missing' });
        }

        // Verify access token
        jwt.verify(token, secret, async (err, decodedToken) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    console.log(req);
                    const refreshToken = req?.headers?.cookie?.split('refreshToken=')[1];
                    console.log(refreshToken);
                    if (!refreshToken) {
                        return res.status(401).json({ message: 'Access token expired, and refresh token is missing' });
                    }
                    
                    // Verify refresh token
                    jwt.verify(refreshToken, secret1, async (err, decodedRefreshToken) => {
                        if (err) {
                            return res.status(401).json({ message: 'Refresh token is invalid' });
                        }
                        
                        // Generate new access token
                        const user = await User.findById(decodedRefreshToken.userId);
                        if (!user) {
                            return res.status(401).json({ message: 'User not found' });
                        }
                        const newAccessToken = jwt.sign({ userId: user._id }, secret, { expiresIn: '10s' });
                        
                        // Attach new access token to request headers
                        req.headers.authorization = `Bearer ${newAccessToken}`;
                        next();
                    });
                } else {
                    return res.status(401).json({ message: 'Access token is invalid' });
                }
            } else {
                req.userId = decodedToken.userId;
                next();
            }
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = authenticate;
