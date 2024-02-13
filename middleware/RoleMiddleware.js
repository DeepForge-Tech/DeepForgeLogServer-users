const jwt = require('jsonwebtoken')

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            const Token = req.cookies['Authorization'].split(' ')[1];
            if (!Token) {
                return res.status(403).json({message: "Вы не авторизованы"})
            }
            const userRoles = jwt.verify(Token,process.env.JWT_SECRET);
            var HasRole = false;
            if (userRoles.roles == roles) {
                HasRole = true;
            }
            if (!HasRole) {
                return res.status(403).json({message: "У вас нет доступа"})
            }
            next();
        } 
        catch (error) {
            console.error(error);
            return res.status(403).json({message: "Вы не авторизованы"})
        }
    }
};