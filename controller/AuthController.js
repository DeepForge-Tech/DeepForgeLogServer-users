const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { validationResult } = require('express-validator');
const DB_SERVICE_URL = "http://localhost:5001"

const generateAccessToken = (id, roles) => {
    const payload = {
        id
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" })
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
            const check_user = await axios.post(DB_SERVICE_URL + '/find', { "data": { username: username }, "table": "users" });
            if (check_user.data.answer == "exists") {
                return res.status(400).json({ message: "A user with the same name already exists" })
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const create_user = await axios.post(DB_SERVICE_URL + '/insert', { "data": { username: username, password: hashPassword }, "table": "users" });
            if (create_user.status == 200) {
                await res.status(200).json({ message: "Success" });
            }
            // return res.json({message: "Пользователь успешно зарегистрирован"})
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ message: 'An error occurred on the server while sending the response' });
        }
    }

    async SignIn(req, res) {
        try {
            const username = req.body["username"];
            const password = req.body["password"];
            const check_user = await axios.post(DB_SERVICE_URL + '/find', { "data": { username: username }, "table": "users" });
            if (check_user.data.answer == "not exists") {
                return res.status(400).json({ message: "User " + username +" not found" })
            }
            const validPassword = bcrypt.compareSync(password, check_user.data.user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Incorrect password entered` })
            }
            const token = generateAccessToken(check_user.data.user.id);
            TempToken = "Bearer " + token;
            res.cookie('Authorization', TempToken);
            
            await res.status(200).json({ message: "OK",name_cookie:"Authorization",token: TempToken});
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: 'An error occurred on the server while sending the response' });
        }
    }
    async Logout(req, res) {
        try {
            await res.clearCookie("Authorization");
            res.status(200).json({ message: "OK" });
        }
        catch (error) {
            console.log(error);
            res.status(400).json({ message: "User is not authorized" });
        }
    }
    async CheckAuthCookie(req, res) {
        if (req.cookies["Authorization"]) {
            res.status(200).json({ message: "OK" });
        }
        else {
            res.status(400).json({ message: "Not Found" });
        }
    }
}

module.exports = new AuthController();