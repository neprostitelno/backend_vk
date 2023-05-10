const db = require('./../models/connection')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {secret} = require('./config')

const generateAccessToken = (id) =>{
    const payload ={
        id
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"})
}

function writeFile(path, data) {
    return new Promise((resolve) => {
        fs.writeFile(path, data, resolve);
    });
}

class UserControllers {
    async createUser(req, res) {
        const {login, password, name, surname, city, birthday, university} = req.body
        const candidate = await db.query('select count(*) from users where login = $1', [login])
        if (candidate.rows[0]['count'] !== '0') {
            return res.status(400).json({message: "Пользователь с таким именем уже существует!"})
        }
        const hashPassword = bcrypt.hashSync(password, 7)
        const newUser = await db.query('insert into users(login, password, name, surname,  city, birthday, university) values($1, $2, $3, $4, $5, $6, $7) returning *', [login, hashPassword, name, surname,  city, birthday, university])
        res.json(newUser.rows[0])
    }

    async signIn(req, res) {
        try {
            const {login, password} = req.body
            const candidate = await db.query('select id, password from users where login = $1', [login])
            if (candidate['rowCount'] === 0) {
                return res.status(400).json({message: "Пользователя с таким именем не существует!"})
            }
            const validPassword = bcrypt.compareSync(password, candidate.rows[0]['password'])
            if (!validPassword) {
                return res.status(400).json({message: "Введен не верный пароль!"})
            }
            const token = generateAccessToken(candidate.rows[0]['id'])
            res.cookie(`Bearer`, token, {secure: true, httpOnly: true})
            res.json({user:candidate.rows[0]['id']}).send()
        } catch (e){
            console.log(e)
        }
    }

    async getUsers(req, res) {
        const page = req.query.page
        const limit = req.query.limit
        const offset = page * limit
        if (req.query.search) {
            const search = req.query.search.split(' ')
            if (search.length > 1){
                const users = await db.query('select id, name, surname, icon from users where ' +
                    '(((name like $1) and (surname like $2)) or ((name like $2) and (surname like $1)))', [search[0]+'%', search[1]+'%'])
                const count = await db.query('select count(*) from users where' +
                    '(((name like $1) and (surname like $2)) or ((name like $2) and (surname like $1)))', [search[0]+'%', search[1]+'%'])
                res.json({result: users.rows, count: count.rows[0].count})
            }
            else if (search.length === 1){
                const users = await db.query('select id, name, surname, icon from users where ' +
                    '((name like $1) or (surname like $1))', [search[0]+'%'])
                const count = await db.query('select count(*) from users where' +
                    '((name like $1) or (surname like $1))', [search[0]+'%'])
                res.json({result: users.rows, count: count.rows[0].count})
            }
            return
        }
        const users = await db.query('select id, name, surname, icon from users limit $1 offset $2',[limit, offset])
        const count = await db.query('select count(*) from users')
        res.json({result: users.rows, count: count.rows[0].count})
    }


    async getOneUser(req, res) {
        const id = req.params.id;
        const user = await db.query('select id, login, name, surname, icon, city, birthday, university  from users where id = $1', [id])
        res.json(user.rows[0])
    }



    async updateUser(req, res) {
        const {id, login, password, email, icon, birthday, city, university} = req.body
        const user = await db.query('update users set login = $1, password = $2, email = $3, birthday = $4, city = $5, university = $6 where id = $7 returning *',
            [login, password, email, birthday, city, university, id])
        res.json(user.rows[0])
    }

    async uploadPhoto(req, res) {
        const decodeData = jwt.verify(req.cookies['Bearer'], secret)
        const path = `/public/users/${decodeData.id}_${req.files.photo.name}`
        await req.files.photo.mv('.' + path)
        const user = await db.query('update users set icon = $1 where id = $2 returning id',[path, decodeData.id])
        res.json(user.rows[0])
    }

    async deleteUser(req, res) {
        const id = req.params.id;
        const user = await db.query('delete from users where id = $1', [id])
        res.clearCookie()
        res.json(user.rows[0])
    }


}

module.exports = new UserControllers();