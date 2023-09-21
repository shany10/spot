// const { db } = require('../config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Db = require('./db');
const { current_date } = require('./generaleFunction');
const { response } = require('express');

const get_user = (email) => {
    if(!email) {
        const data = { statu: 'error', message:"Email absent" } 
        return data
    }
    const select_sql = `SELECT * FROM user WHERE email = '${email}'`
    const data = Db.query(select_sql)
        .then((res) => {
            const response = { statu: 'success', data: res[0] }
            return response
        })
        .catch(error => {
            const response = { statu: 'error', messsage: error }
            return response
        })
    return data;
}


const compare_user_password = (password, hash_password_in_db) => {
    const data = bcrypt.compare(password, hash_password_in_db)
        .then(response => {
            const data = {
                statu: "success",
                is_password_match: response
            }
            return data
        })
        .catch(error => {
            const data = {
                statu: "error",
                message: error
            }
            return data
        })
    return data
}


const hash = (password) => {
    const hash_password = bcrypt.hash(password, 10)
        .then(response => {
            return response
        })
        .catch(error => {
            console.log(error)
        })
    return hash_password
}


const add_user = async (user_model) => {
    user_model.create_at = current_date()
    const insert_sql = `INSERT INTO user (name, lastname, email, password, create_at) VALUES ( ? )`
    const data = await Db.query(insert_sql, [user_model.model()])
        .then(res => {
            const response = { statu: 'success', data: res }
            return response
        })
        .catch(error => {
            const response = { statu: 'error', message: error }
            return response
        })
    return data;
}


const update_user = async (modification) => {
    modification.update_at = current_date()
    if (!modification.email) {
        const data = { statu: 'error', message: "Email absent" }
        return data
    }
    const update_sql = `UPDATE user SET ? WHERE email = '${modification.email}' `
    const data = await Db.query(update_sql, modification)
        .then(res => {
            const response = { statu: 'success', data: res }
            return response
        })
        .catch(error => {
            const response = { statu: 'error', message: error }
            return response
        })
    return data
}


const delete_user = async (email) => {
    if(!email) {
        const data = { statu: 'error', message: "Email absent" }
        return data
    }

    const delete_sql = `DELETE FROM user WHERE email = ? ` 
    const data = await Db.query(delete_sql, email)
        .then(res => {
            const response = { statu: 'success', data: res }
            return response
        })
        .catch( error => {
            const response = { statu: 'error', message: error }
            return response
        })
    return data    
}


const verify_JWT = (req, res, next) => {
    const token = req.headers["x-access-token"]
    if (!token) {
        res.send("token not found")
    }
    else {
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) {
                res.json({ auth: false, message: "failed to authenticate" })
            }
            else {
                req.user_id = decoded.id
                next();
            }
        })
    }
}


module.exports = {
    get_user,
    compare_user_password,
    hash,
    add_user,
    update_user,
    delete_user,
    verify_JWT
}