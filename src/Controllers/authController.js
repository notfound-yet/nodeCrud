const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const authConfig = require('../../config/auth');
const router = express.Router();


function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        if (await User.findOne({ where: { email } }))
            return res.status(400).send({ error: "user already exists" });

        const user = await User.create(req.body);

        user.password = undefined;

        return res.status(201).send({ user, token: generateToken({ id: user.id }) });
    } catch {
        return res.status(400).send({ error: false });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;


    User.findOne({ where: { email } }).then(async function (user) {
        if (!user) {
            return res.status(400).send({ error: false });
        } else if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: false });
        } else {
            //req.session.user = user.dataValues;
            user.password = undefined;

            return res.status(200).send({ user, token: generateToken({ id: user.id }) });

            res.redirect('/dashboard');
        }
    });
})

module.exports = app => app.use('/auth', router);