const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 12;

exports.signUp = async (req, res) => {
    const {username, password} = req.body;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashPassword = bcrypt.hashSync(password, salt);
    try {
        const newUser = await User.create({
            username,
            password: hashPassword,
        });
        // Get session
        //req.session.user = newUser;

        res.status(200).json({
            status: "success",
            data: {
                user: newUser,
            },
        })
    }catch (e) { 
        //console.log(e)
        res.status(400).json({
            status: "fail",
        })
    }
}

exports.login = async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({ username });

        if(!user){
            res.status(404).json({
                status: "fail",
                message: "User not found"
            })
        }

        const isCorrect = bcrypt.compareSync(password, user.password);

        if(isCorrect){
            // Get session
            //req.session.user = user;

            res.status(200).json({
                status: "success"
            })
        }else{
            res.status(400).json({
                status: "fail",
                message: "Incorrect username or password"
            })
        }
    }catch (e) { 
        //console.log(e)
        res.status(400).json({
            status: "fail",
        })
    }
}
