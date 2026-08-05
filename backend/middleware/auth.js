import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "pollify_super_secret_jwt_key_2026"

export const protect = (req, res, next) => {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null
    if (!token)
        return res.status(401).json({
            message: "Not authorized, no token"
        })
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.userId = decoded.id
        next()
    } catch {
        res.status(401).json({
            message: "Not authorized, token invalid"
        })
    }
}

