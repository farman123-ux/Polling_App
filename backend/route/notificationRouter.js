import express from 'express'
import { protect } from '../middleware/auth.js'
import { getNotifications, markRead } from '../controller/notificationController.js'

const notifiactionRouter = express.Router()

notifiactionRouter.use(protect)

notifiactionRouter.get('/',getNotifications)
notifiactionRouter.patch('/read',markRead)

export default notifiactionRouter
