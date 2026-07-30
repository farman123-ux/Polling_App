import Notification from "../model/Notification.js";

// create the notification

export const notify = async ({ user, actor, poll, type }) => {
    if (!user || String(user) === String(actor))
        return// skip self actions 
    try {
        await Notification.create({ user, actor, poll, type })

    } catch (error) {
        //ignor
    }
}
// unread count with the latest notifiaction

export const getNotifications = async (req, res) => {
    try {
        const items = await Notification.find({ user: req.userId })
            .populate("actor", "name username avatar")
            .populate("poll", "question")
            .sort("-createdAt")
            .limit(20)
        const unread = await Notification.countDocuments({
            user: req.userId, read: false
        })
        res.json({
            items,
            unread
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// to mark all notification as read
export const markRead = async (req, res) => {
    try {
        await Notification.updateMany({
            user: req.userId, read: false
        }, {
            read: true
        })
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
