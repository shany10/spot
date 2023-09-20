const express = require("express");
// const session = require('express-session')
const mysql = require('mysql');
const { db } = require('../config');
const { FieldValue } = require("firebase-admin/firestore");
const userModel = require('../model/userModel.js');
const jwt = require('jsonwebtoken');

const router = express.Router();

const db_mysql = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER_NAME,
    password: process.env.DB_USER_PASSWORD,
    database: process.env.DB
});



//FUNCTION
const {
    get_user,
    compare_user_password,
    hash,
    add_user_to_db,
    verify_JWT
} = require("../function/userFunction")

//VARIABLE
const saltRounds = 10;



//TEST

router.get('/test-user', async (req, res) => {

    db_mysql.connect(function (err) {
        if (err) throw err;
        console.log("Connected to mysql!");
        const insert_sql = `INSERT INTO user (name, lastname, email, password) 
                    VALUES ('shany', 'fox', 'shany@gmail.com', 'azerty')`;
        const select_sql = `SELECT * FROM user`            

        db_mysql.query(select_sql, (err, result, fields) => {
            if (err) throw err;
            console.log(result[0].id);
        })
    });

    res.send("test")
})



//GET USER

router.get('/get-user', async (req, res) => {
    const data = await db.collection('users').get()
    const list = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.send(list)
})



//ADD USER

router.post('/add-user', async (req, res) => {

    //recuperation du user vie a l'email
    const user = await get_user(req.body.email)

    //Vérifier si l'email existe déjà dans la DB
    if (user.length > 0) {
        if (user[0]?._fieldsProto) {
            const data = {
                statu: "error",
                message: "L'email est déjà utilsé"
            }
            res.send(data);
            return;
        }
    }

    //construction et verification du schéma des données reçu
    const user_model = new userModel(req.body)
    if (user_model.model().error) {
        res.send(user_model.model().error);
        return;
    }

    //Hashage du mot de passe de l'utilisateur 
    user_model.hashPassword = await hash(req.body.password)

    //Insertion des données traiter dans la DB (users)
    const data = await add_user_to_db(user_model.model())
    res.status(200).send(data)
});



// UPDATE USER 

router.post('/update-ser', async (req, res) => {
    const id = req.body.id
    delete req.body.id
    await db.collection('users').doc(id).update(req.body)
})

router.delete('/delete-user', async (req, res) => {
    const user = db.collection('partyparty').doc('Users')
    const res2 = await user.update({
        1: FieldValue.delete()
    })
    res.status(200).send('user is delete')
})



// SIGN IN 

router.post('/compare-user', async (req, res) => {

    //recuperation du user vie a l'email
    const user = await get_user(req.body.email)

    //vérifier si user a un compte
    if (user.length == 0) {
        const message = {
            statu: "error",
            auth: false,
            message: "Utilisateur introuvable"
        }
        res.send(message);
        return;
    }

    //vérifier si c'est le bon mot de passe 
    const data = await compare_user_password(req.body.password, user[0]._fieldsProto.hashPassword.stringValue)
    if (!data.is_password_match) {
        res.json({
            auth: false,
            message: "Mot de passe invalide"
        });
        return;
    }

    const id = user[0]._ref._path.segments[1]
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: 300
    })
    req.session.user = user[0]._fieldsProto
    const resulte = {
        name: user[0]._fieldsProto.name.stringValue,
        lastname: user[0]._fieldsProto.lastname.stringValue
    }
    res.json({ auth: true, token: token, resulte: resulte });
})



//IS USER AUTHENTICATE

router.get('/is-auth', verify_JWT, (req, res) => {
    console.log(req.user_id)
    res.send("is authenticate valide")
})

module.exports = router