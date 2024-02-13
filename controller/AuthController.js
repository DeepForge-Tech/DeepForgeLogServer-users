const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { validationResult } = require('express-validator');
const DB_SERVICE_URL = "http://localhost:5001"

const generateAccessToken = (id, roles) => {
    const payload = {
        id
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"} )
}
var TempToken = "";

class AuthController {
    async SignUp(req, res) {
        try {
            const username = req.body["username"];
            const password = req.body["password"];
            const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(400).json({message: "Ошибка при регистрации", errors})
            // }
            const check_user = await axios.post(DB_SERVICE_URL + '/find', { "data": {username:username},"table":"users"});
            if(check_user.data.answer == "exists")
            {
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const create_user = await axios.post(DB_SERVICE_URL + '/insert', { "data": {username:username,password:hashPassword},"table":"users"});
            if (create_user.status == 200)
            {
                await res.redirect('/auth/signin');
            }
            // return res.json({message: "Пользователь успешно зарегистрирован"})
        } 
        catch (error) {
            console.log(error);
            res.status(400).json({message: 'Произошла ошибка на сервере при отправке ответа'});
        }
    }

    async SignIn(req, res) {
        try {
            const username = req.body["username"];
            const password = req.body["password"];
            const check_user = await axios.post(DB_SERVICE_URL + '/find', { "data": {username:username},"table":"users"});
            if(check_user.data.answer == "not exists")
            {
                return res.status(400).json({message: `Пользователь ${username} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, check_user.data.user.password);
            if (!validPassword) {
                return res.status(400).json({message: `Введен неверный пароль`})
            }
            const token = generateAccessToken(check_user.data.user.id);
            res.cookie('Authorization', "Bearer " + token);
            TempToken = "Bearer " + token;
            await res.redirect('/')
            // return res.json({token});
        } catch (error) {
            console.log(error);
            res.status(400).json({message: 'Произошла ошибка на сервере при отправке ответа'});
        }
    }
    async Logout(req,res) {
        try {
            await res.clearCookie("Authorization");
            await res.redirect('/auth/signin');
        }
        catch(error) {
            console.log(error);
        }
    }
}

module.exports = new AuthController();