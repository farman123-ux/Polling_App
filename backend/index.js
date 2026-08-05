import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectdb } from './config/dbConnection.js'
import authRouter from './route/authRouter.js'
import notifiactionRouter from './route/notificationRouter.js'
import pollRouter from './route/pollRouter.js'
import commentRoutes from './route/commentRouter.js'
import userRouter from './route/userRouter.js'
import apiLogger from './middleware/apiLogger.js'

const PORT = process.env.PORT || 5000;
const app = express()

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        return callback(null, origin);
    },
    credentials: true
}))
app.use(express.json())
app.use(apiLogger)

// Connect DB middleware for Vercel serverless
app.use(async (req, res, next) => {
    try {
        await connectdb();
        next();
    } catch (err) {
        res.status(500).json({ message: "Database connection failure: " + err.message });
    }
});

// Routes
app.use('/api/auth', authRouter)
app.use('/api/poll', pollRouter)
app.use('/api/comment', commentRoutes)
app.use('/api/users', userRouter)
app.use('/api/notification', notifiactionRouter)

app.get('/', (req, res) => {
    res.send("Pollify Backend API is running")
})

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running.. http://localhost:${PORT}`)
    })
}

export default app
