const express = require("express");
// const session = require('express-session')
const { db } = require('../config');
const { FieldValue } = require("firebase-admin/firestore");
const userModel = require('../model/userModel.js');
const jwt = require('jsonwebtoken');
const Db = require('../function/db');

const router = express.Router();

//FUNCTION
const {
    get_user,
    compare_user_password,
    hash,
    add_user,
    update_user,
    delete_user,
    verify_JWT
} = require("../function/userFunction")

//VARIABLE
const saltRounds = 10;



//TEST

router.get('/test-user', async (req, res) => {

    const insert_sql = `INSERT INTO user (name, lastname, email, password) 
                    VALUES ('shany', 'fox', 'shany@gmail.com', 'azerty')`;
    const select_sql = `SELECT * FROM user`

    Db.query(select_sql, (err, result, fields) => {
        if (err) throw err;
        console.log(result[0].id);
    })
    res.send("test")
})



//GET USER

router.get('/get-all-user', async (req, res) => {

    Db.query(`SELECT * FROM user`, (err, result, fields) => {
        if (err) throw res.send(err);
        res.status(200).send(result);
    })

})



//ADD USER

router.post('/add-user', async (req, res) => {

    //recuperation du user vie a l'email
    const user = await get_user(req.body.email)

    // Vérifier si l'email existe déjà dans la DB
    if (user.length > 0) {
        const data = {
            statu: "error",
            message: "L'email est déjà utilsé"
        }
        res.send(data);
        return;
    }

    // construction et verification du schéma des données reçu
    const user_model = new userModel(req.body)
    if (user_model.model().error) {
        res.send(user_model.model().error);
        return;
    }

    //Hashage du mot de passe de l'utilisateur 
    user_model.password = await hash(req.body.password)

    //Insertion des données traiter dans la DB (user)
    const data = await add_user(user_model)
    res.status(200).send(data)
});



// UPDATE USER 

router.post('/update-user', async (req, res) => {
    const data = await update_user(req.body)
    res.status(200).send(data)
})



// DELETE USER

router.delete('/delete-user', async (req, res) => {
    const data = await delete_user(req.body.email)
    res.status(200).send(data)
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
    const data = await compare_user_password(req.body.password, user.data.password)
    if (!data.is_password_match) {
        res.json({
            auth: false,
            message: "Invalide password"
        });
        return;
    }

    const id = user.data.id
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: 300
    })
    req.session.user = user.data
    const resulte = {
        name: user.data.name,
        lastname: user.data.lastname
    }
    res.json({ auth: true, token: token, resulte: resulte });
})



//IS USER AUTHENTICATE

router.get('/is-auth', verify_JWT, (req, res) => {
    console.log(req.user_id)
    res.send("is authenticate valide")
})

module.exports = router