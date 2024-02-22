const jwt = require('jsonwebtoken')
const axios = require("axios");

const DB_SERVICE_URL = "http://localhost:5001" || process.env.DB_SERVICE_URL;

module.exports = function (role) {
    return async function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            const Token = req.cookies['Authorization'].split(' ')[1];
            if (!Token) {
                return res.status(400).json({message: "You are not authorized"})
            }
            const userData = jwt.verify(Token,process.env.JWT_SECRET);
            const user = await axios.post(DB_SERVICE_URL + '/find', { "data": { id: userData.id }, "table": "users" });
            var hasRole = false;
            if (user.data.record.role == role) {
                hasRole = true;
            }
            if (!hasRole) {
                return res.status(400).json({message: "You don't have access"})
            }
            next();
        } 
        catch (error) {
            console.error(error);
            return res.status(400).json({message: "You are not authorized"})
        }
    }
};