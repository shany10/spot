require('dotenv').config();
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const general_route = require("./routes/gerneral")
const user_route = require("./routes/user")

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
    session({
        key: "userId",
        secret: "suscribe",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24
        }
    })
)
app.use("/api/", general_route)
app.use("/api/", user_route)

app.get('/', (req, res) => res.send("Bienvenue sur l'api de PartyParty"))
app.listen(process.env.PORT, () => console.log(`go to port => ${process.env.PORT}`))