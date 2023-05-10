const db = require('./../models/connection')
const jwt = require("jsonwebtoken");
const {secret} = require("./config");


class FriendsControllers {

    async followChecker(req, res) {
        const id = req.params.id;
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const check = await db.query('select count(*) from friends where followerid = $1 and followingid = $2', [decodeData.id, id])
        res.json({follow:check.rows[0]['count'] !== '0'})
    }


    async getFollowers(req, res) {
        const id = req.params.id;
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const page = req.query.page
        const limit = req.query.limit
        const offset = page * limit
        const followers = await db.query('select followerid, users.icon, users.name, users.surname '+
            'from friends join users on users.id = followerid where followingid = $1 limit $2 offset $3',[id, limit, offset])
        const followers_result = []
        await followers.rows.map(async (r) => {
            const follow_check = await db.query('select exists(select 1 from friends where followerid = $1 and followingid = $2)', [decodeData.id, r.followerid])
            r.following = follow_check.rows[0].exists
            followers_result.push(r)
        })
        const count = await db.query('select count(*) from friends join users on users.id = followerid where followerid = $1',[id])
        res.json({result:followers_result, count: count.rows['0'].count})
    }

    async getFollowings(req, res) {
        const id = req.params.id;
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const page = req.query.page
        const limit = req.query.limit
        const offset = page * limit
        const followings = await db.query('select followingid, users.icon, users.name, users.surname '+
            'from friends join users on users.id = followingid where followerid = $1 limit $2 offset $3',[id, limit, offset])
        const followings_result = []
        await followings.rows.map(async (r) => {
            const follow_check = await db.query('select exists(select 1 from friends where followerid = $1 and followingid = $2)', [decodeData.id, r.followingid])
            r.following = follow_check.rows[0].exists
            followings_result.push(r)
        })
        const count = await db.query('select count(*) from friends join users on users.id = followingid where followerid = $1',[id])
        res.json({result: followings_result, count: count.rows['0'].count})
    }

    async postFollow(req, res) {
        const id = req.params.id;
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        if(decodeData.id === id){
            res.status(403).json({message: "Нельзя подписаться на самого себя!"})
            return
        }
        const candidate = await db.query('select count(*) from friends where followerid = $1 and followingid = $2', [decodeData.id, id])
        if (candidate.rows[0]['count'] !== '0') {
            res.status(403).json({message:"Вы уже подписаны!"})
            return
        }
        const friend = await db.query('insert into friends(followerid, followingid) values($1, $2) returning *', [decodeData.id, id])
        res.json(friend.rows[0])
    }

    async deleteUnfollow(req, res) {
        const id = req.params.id;
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const candidate = await db.query('select count(*) from friends where followerid = $1 and followingid = $2', [decodeData.id, id])
        if (candidate.rows[0]['count'] === '0') {
            res.status(403).json({message:"Вы еще не подписаны подписаны!"})
            return
        }
        await db.query('delete from friends where followerid = $1 and followingid = $2', [decodeData.id, id])
        res.json({message: 'Удален'})
    }

}

module.exports = new FriendsControllers();