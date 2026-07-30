import Comment from "../model/Comment.js";
import User from "../model/User.js";

// to het the count for the total users save  and comments

async function countsFor(pollIds) {
    if (!pollIds.length)
        return { commentMap: {}, saveMap: {} }

    const [comments, saves] = await Promise.all([
        Comment.aggregate([
            { $match: { poll: { $in: pollIds } } },
            { $group: { _id: "$poll", n: { $sum: 1 } } },
        ]),
        User.aggregate([
            { $match: { bookmarks: { $in: pollIds } } },
            { $unwind: "$bookmarks" },
            { $match: { bookmarks: { $in: pollIds } } },
            { $group: { _id: "$bookmarks", n: { $sum: 1 } } },
        ]),
    ]);
    const commentMap = {};
    const saveMap = {};
    comments.forEach((c) => (commentMap[String(c._id)] = c.n));
    saves.forEach((s) => (saveMap[String(s._id)] = s.n));
    return {commentMap,saveMap}
}

// to show comment and save on the poll

export async function withCounts(shapePoll) {
    const {commentMap,saveMap} = await countsFor(
        shapePoll.map((p)=> p._id)
    )
    return shapePoll.map((p)=>({
        ...p,
        comments : commentMap[String(p._id)] || 0,
        saves : saveMap[String(p._id)] || 0
    }))
}