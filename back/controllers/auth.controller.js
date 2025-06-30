const User = require("../models/user.model");
const bcrypt = require('bcryptjs');
const { createAccessToken } = require('../libs/jwt');

const register = async (req, res) => {

    const {email, password, username} = req.body;

    try {

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: passwordHash
        });

        const userSaved = await newUser.save();
        const token = await createAccessToken({id: userSaved._id});

        res.cookie('token', token);
        res.status(200).json({
            message: "user created successfully"
        });

    } catch (error) {
        console.log(error);
    }
    
}

const login = async (req, res) => {

    const {email, password} = req.body;

    try {

        const userFound = await User.findOne({email});

        if(!userFound) return res.status(400).json({message: "User not found"});

        const isMatch = await bcrypt.compare(password, userFound.password);

        if(!isMatch) return res.status(400).json({message: "Incorrect password"});

        const token = await createAccessToken({id: userFound._id});

        res.cookie('token', token);
        res.status(200).json({
            message: "Welcome"
        });

    } catch (error) {
        console.log(error);
    }
    
}

const logout = (req, res) => {
    res.cookie('token', "", {expires: new Date(0)})
    return res.status(200).json({ message: "Bye"});
}

module.exports = {
    register,
    login,
    logout
}