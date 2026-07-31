import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectdb } from './config/dbConnection.js'
import authRouter from './route/authRouter.js'
import notifiactionRouter from './route/notificationRouter.js'
import pollRouter from './route/pollRouter.js'
import commentRoutes from './route/commentRouter.js'
import userRouter from './route/userRouter.js'

const PORT = process.env.PORT || 5000;
const app = express()


// Middleware
app.use(cors({
    origin : process.env.CLIENT_URL,credentials:true
}))
app.use(express.json())

//DB
connectdb()
//Routes
app.use('/api/auth',authRouter)
app.use('/api/poll',pollRouter)
app.use('/api/comment',commentRoutes)
app.use('/api/users',userRouter)
app.use('/api/notification',notifiactionRouter)





app.get('/',(req,res)=>{
    res.send("hello word")
})

app.listen(PORT,()=>{
    console.log(`Server is running.. http://localhost:${PORT}`);
    
})
