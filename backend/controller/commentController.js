import Comment from "../model/Comment.js";
import Poll from "../model/Poll.js";
import { notify } from "./notificationController.js";

// to get all comment for a poll
export const getComments = async (req,res) => {
    try {
        const comments = await Comment.find({poll : req.params.pollId})
        .populate("user", "name username avatar")
        .sort("-createdAt")
        res.json(comments)
    } catch (err) {
        res.status(500).json({
            message : err.message
        })
    }
}

// to add comment to poll
export const addComment = async (req,res) => {
    try {
        const text = (req.body.text || "").trim()
        if(!text)
            return res.status(400).json({
        message : "comment cannot be empty"
    })
    const comment = await Comment.create({
        poll : req.params.pollId,
        user: req.userId,
        parent : req.body.parent || null,
        text
    })
    const populated = await comment.populate("user", "name username avatar")
    const poll = await Poll.findById(req.params.pollId).select('creator')
    if(poll) 
        await notify({
    user : poll.creator,
    actor : req.userId,
    poll : poll._id,
    type : "comment"
        })
        res.status(201).json(populated)
    } catch (err) {
        res.status(500).json({
            message : err.message
        })
    
    }
}

export const deleteComment = async (req,res) =>{
    try {
        const comment = await Comment.findById(req.params.id)
        if(!comment) 
            return res.status(404).json({
        message : "comment not found"})
        if(String(comment.user) !==String(req.userId))
            return res.status(403).json({
        message : "not your comment"
    })
    await Comment.deleteMany({$or: [{_id : comment._id}, {parent : comment._id}]
    })
    res.json({
        message: "deleted"
    })
    } catch (err) {
        res.status(500).json({
            message : err.message
        })
    }
}
