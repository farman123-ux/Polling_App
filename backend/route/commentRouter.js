import express from 'express'
import { protect } from '../middleware/auth.js'
import { addComment, deleteComment, getComments } from '../controller/commentController.js'

const commentRoutes = express.Router()

commentRoutes.use(protect)
commentRoutes.get('/:pollId',getComments)
commentRoutes.post('/:pollId', addComment)

commentRoutes.delete('/:id',deleteComment)

export default commentRoutes
