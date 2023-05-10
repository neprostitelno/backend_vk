const express =  require("express")
const router = express.Router()
const UserControllers = require("../Controllers/User.controllers")
const authMiddleware = require('./../middleware/authMiddleware')
const PostControllers = require("../Controllers/Post.controllers");
const FriendsControllers = require("../Controllers/Friends.controllers")

router.post("/create_user", UserControllers.createUser)
router.post("/sign_in", UserControllers.signIn)
router.get('/user', authMiddleware, UserControllers.getUsers)
router.get("/user/:id", authMiddleware,UserControllers.getOneUser)
router.put("/update_user", authMiddleware,UserControllers.updateUser)
router.put('/upload_photo', authMiddleware, UserControllers.uploadPhoto)
router.delete("/delete_user/:id",authMiddleware, UserControllers.deleteUser)

router.post("/create_post", authMiddleware, PostControllers.createPost)
router.get("/user/:id/posts", authMiddleware, PostControllers.getPosts )
router.get("/feed", authMiddleware, PostControllers.getFollowingPost)

router.post("/user/:id/follow", authMiddleware, FriendsControllers.postFollow)
router.delete("/user/:id/unfollow", authMiddleware, FriendsControllers.deleteUnfollow)
router.get("/user/:id/follower", authMiddleware, FriendsControllers.getFollowers)
router.get("/user/:id/following", authMiddleware, FriendsControllers.getFollowings)
router.get("/user/:id/followcheck", authMiddleware, FriendsControllers.followChecker)

module.exports = router