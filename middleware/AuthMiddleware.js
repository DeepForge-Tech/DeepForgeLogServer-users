const jwt = require('jsonwebtoken');

module.exports =  function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        const Token = req.cookies['Authorization'].split(' ')[1];
        if (!Token) {
            return res.status(403).json({message: "Вы не авторизованы"})
        }
        const decodedData = jwt.verify(Token, process.env.JWT_SECRET);
        req.user = decodedData;
        next();
    } catch (error) {
        console.log(error);
        // return res.status(403).json({message: "Произошла ошибка на сервере при отправке ответа"})
        return res.status(403).json({message: "Вы не авторизованы"})
    }
};