// Импортирование необходимых библиотек
const express = require('express');
const path = require('path');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const RoleMiddleware = require('./middleware/RoleMiddleware');
const session = require('express-session');
const Controller = require('./controller/AuthController');
const { check } = require("express-validator");

// Инициализация сервера
const app = express()
const urlencodedParser = express.urlencoded({ extended: false });

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
// Переменные
const PORT = process.env.USER_SERVICE_PORT || 5003;
const DB_SERVICE_URL = "http://localhost:5001"

// app.use("/auth",AuthRouter);
// app.use("/",WorkRouter);

// Назначение движка рендеринга ejs(html) файлов
app.set('view engine', 'ejs');
app.set('views', './views');
// Назначение пути для статических файлов
app.use('/static', express.static('static'))
app.use(express.static(__dirname + '/static'));

// Функции
// async function isAdmin(req,res) {

//     if (req.cookies['Authorization']) {
//         const Token = req.cookies['Authorization'].split(' ')[1];
//         const userRoles = jwt.verify(Token,process.env.JWT_SECRET);
//         if (userRoles.roles == "Admin") {
//             return true
//         }
//         else {
//             return false
//         }
//     }
// }
// Views
app.post('/signup', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 8 символов").isLength({ min: 8 })
], urlencodedParser, Controller.signUp);
app.post('/login', urlencodedParser, Controller.signIn);
app.get("/logout", urlencodedParser, AuthMiddleware, Controller.logout);
app.get("/check_auth_cookie",urlencodedParser, Controller.checkAuthCookie);
app.get("/find_all_users",urlencodedParser,AuthMiddleware,RoleMiddleware("Administrator"),Controller.findAllUsers);
app.post("/create_user",urlencodedParser,AuthMiddleware,RoleMiddleware("Administrator"),Controller.createUser);
// app.get('/dashboard/:model_name',RoleMiddleware("Admin"), async function(req,res) {
//     var admin = await isAdmin(req,res);
//     var model_name = req.params.model_name;
//     var existModel = await CheckModel(model_name);
//     if (existModel == true) {
//         var model = await GetModel(model_name);
//         var model = await model.find();
//         await res.render('Model',{isAdmin: admin,model:model,ModelName:model_name});
//     }
//     else {
//         await res.redirect("/models/model_not_find")
//     }
// })
// app.get('/dashboard/:model_name/:id_model/delete',RoleMiddleware("Admin"), async function(req,res) {
//     var admin = await isAdmin(req,res);
//     var model_name = req.params.model_name;
//     var id_model = req.params.id_model;
//     var existModel = await CheckModel(model_name);
//     if (existModel == true) {
//         var model = await GetModel(model_name);
//         var model = await model.findById(id_model);
//         model.deleteOne();
//         await res.redirect("/dashboard/" + model_name);
//         // await res.render('Model',{isAdmin: admin,model:model,ModelName:model_name});
//     }
//     else {
//         await res.redirect("/models/model_not_find")
//     }
// })
// res.status(502).render('502',{isAdmin: admin});
// })

app.listen(PORT, () => console.log("Users microservice listening on port " + PORT))
module.exports = app;