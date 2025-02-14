    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const mongoose = require("mongoose");
    const employeeSchema = new mongoose.Schema({
        username:{
            type:String,
            required:true,
        },
        phoneNo:{
            type:Number,
            required:true,
        },
        email:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
        },
        cpassword:{
            type:String,
            required:true, 
        },
        accountType:{
            type: String,
            enum: ['user', 'owner'],
            required:true,  
        },
        tokens:[{
            token:{
                type:String,
                require:true,
            }
        }]
    });

    employeeSchema.methods.generateAuthToken = async function(){
        try{
            const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
            this.tokens = this.tokens.concat({token:token});
            await this.save();
            return token;
        }catch(error){  
            res.send(error);
            // console.log(error);
        }
    }


    //cobverting password into Hash
    employeeSchema.pre("save", async function(next){
    if(this.isModified("password")){   
        this.password = await bcrypt.hash(this.password, 10);
        this.cpassword = await bcrypt.hash(this.cpassword, 10);
        //  console.log(this.password);
    }
    next();
    });     

    // now we need to create collection->

    const Register = new mongoose.model("Register",employeeSchema);

    module.exports = Register;