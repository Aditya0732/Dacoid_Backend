const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, "secretpassword", { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    try {
        return jwt.sign({ userId: user._id }, "secretpassword2", { expiresIn: '1d' });
    } catch (error) {
        console.log("Error here", error);
    }

};

exports.signup = async (req, res) => {
    try {
        const { email, firstName, lastName, password, terms } = req.body;
        const existingEmailUser = await User.findOne({ email });

        if (existingEmailUser) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const newUser = await User.create({ email, firstName, lastName, password, terms });
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        const result = await newUser.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: 'User created successfully', user: newUser, accessToken: accessToken });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: 'User logged in successfully', user, accessToken: accessToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};