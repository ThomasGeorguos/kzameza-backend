const jwt = require('jsonwebtoken');

const auth = (requiredRole = null) => {
    return (req, res, next) => {

        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided.' })
        }

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: 'Invalid token.' })
            }

            req.user = decoded

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied, insufficient permissions.' })
            }

            next()
        })
    }
}

module.exports = auth;