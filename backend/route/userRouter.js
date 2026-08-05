import express from 'express'
import { protect } from '../middleware/auth.js'
import { getConnections } from '../controller/authController.js'
import { getPublicProfile, toggleFollow } from '../controller/userController.js'

const userRouter = express.Router()

userRouter.use(protect)

userRouter.get('/:username/connection', getConnections)
userRouter.get('/:username/connections', getConnections)
userRouter.get('/:username', getPublicProfile)

userRouter.post('/:username/follow', toggleFollow)

export default userRouter
