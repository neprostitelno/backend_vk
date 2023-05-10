const db = require('./../models/connection')
const jwt = require("jsonwebtoken");
const {secret} = require("./config");

class PostControllers {


    async getPosts(req, res) {
        const authorid = req.params.id
        const page = req.query.page
        const limit = req.query.limit
        const offset = page * limit
        const posts = await db.query('select posts.id, title, content, authorid, users.name, users.surname, users.icon, postdate ' +
            'from posts join users on users.id = authorid where authorid = $1 limit $2 offset $3',[authorid, limit, offset])
        res.json({result:posts.rows})
    }

    async createPost(req, res) {
        const {title, content} = req.body
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const date = new Date();
        const newPost = await db.query('insert into posts(title, content, authorid, postdate)  values($1, $2, $3, $4) returning *', [title, content, decodeData.id,date])
        res.json(newPost.rows[0])
    }

    async getFollowingPost(req, res) {
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const page = req.query.page
        const limit = req.query.limit
        const offset = page * limit
        const posts = await db.query('select posts.id, title, content, authorid, users.name, users.surname, users.icon, postdate ' +
            'from posts join users on users.id = authorid where authorid in (select followingid from friends where ' +
            'followerid = $1) limit $2 offset $3',[decodeData.id, limit, offset])
        const count = await db.query('select count(*) ' +
            'from posts join users on users.id = authorid where authorid in (select followingid from friends where ' +
            'followerid = $1)', [decodeData.id])
        res.json({result: posts.rows, count: count.rows[0].count})
    }

}

module.exports = new PostControllers();