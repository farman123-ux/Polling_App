import express from 'express'
import { protect } from '../middleware/auth.js'
import {createPoll, getBoolMarks, getMyPolls, getPoll, getPollAnalytice, getTrending, getVotedPolls, listPolls} from '../controller/pollController.js'
import { upload } from '../config/cloudinary.js'
import { closePoll, deletePoll, removeVote, toggleBookmark, updatePoll, votePoll } from '../controller/voteController.js'


const pollRouter = express.Router()

pollRouter.use(protect)
pollRouter.get('/',listPolls)
pollRouter.post('/',upload.array("image",4),createPoll)
pollRouter.get('/mine',getMyPolls)

pollRouter.get('/votes',getVotedPolls)
pollRouter.get('/bookmarks',getBoolMarks)
pollRouter.get('/trending', getTrending)
pollRouter.get('/:id/anaytics',getPollAnalytice)

pollRouter.get('/:id',getPoll)

//vote
pollRouter.post('/:id/vote',votePoll)
pollRouter.post('/:id/vote',removeVote)
pollRouter.patch('/:id/close',closePoll)

pollRouter.patch('/:id',updatePoll)
pollRouter.delete('/:id',deletePoll)
pollRouter.post('/:id/bookmark',toggleBookmark)


export default pollRouter
