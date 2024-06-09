const  mongoose  = require('mongoose');
require('dotenv').config(); 

 
mongoose.connect(process.env.mongo_URL).then(() => {
    console.log("connected to the database");
}   
).catch((err) => {
    console.log('error database' +err);  
}) 