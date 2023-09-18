const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
    res.send(process.env.FIREBASE_MEASUREMENT_ID)
})

module.exports = router