const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async (req,res,next) => {
    try{
        const token = req.cookies.jwt;
        const userverify = jwt.verify(token,process.env.SECRET_KEY);
        const user = await Register.findOne({_id:userverify._id});
        console.log(user.username);
        req.token = token;
        req.user = user;
        next();        
    }catch(error){
        res.status(400).send("You have to login again, Token Expired");
    }
}

module.exports = auth; 