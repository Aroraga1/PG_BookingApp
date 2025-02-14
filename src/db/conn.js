const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/uty").then(()=>{
    console.log(`connection joined`);
}).catch((e)=>{
    console.log(`no connection`);
    console.log(e.message);
});   