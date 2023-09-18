const { db } = require('../config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const get_user = async (email) => {
    const user = [];
    await db.collection('users')
        .where('email', '==', email)
        .get()
        .then((snap) => {
            snap.docs.forEach(doc => {
                user.push(doc)
            })
        })
    return user;
}


const compare_user_password = async (password, hash_password_in_db) => {
    const data = await bcrypt.compare(password, hash_password_in_db)
        .then(response => {
            const data = {
                statu : "success",
                is_password_match : response
            }
            return data
        })
        .catch(error => {
            const data = {
                statu : "error",
                message : error
            }
            return data
        })
    return data
}


const hash = async (password) => {
    const hash_password = await bcrypt.hash(password, 10)
        .then(response => {
            return response
        })
        .catch(error => {
        })
    return hash_password    
}


const add_user_to_db = async(user_model) => {
    const data = await db.collection('users')
    .add(user_model)
    .then((docRef) => {
        const data = {
            statu: "success",
            message: "L'utilsateur a été ajouter avec succée",
            user_id: docRef.id
        }
        return data;
    })
    .catch((error) => {
        const data = {
            statu: "error",
            message: error,
        }
        return data;
    });
    return data;
}


const verify_JWT = (req, res, next) => {
    const token = req.headers["x-access-token"]
    if(!token) {
        res.send("token not found")
    }
    else {
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if(error) {
                res.json({ auth: false, message: "failed to authenticate" })
            }
            else {
                req.user_id = decoded.id
                next();
            }
        } )
    }
}


module.exports = { 
    get_user, 
    compare_user_password, 
    hash, 
    add_user_to_db,
    verify_JWT
}