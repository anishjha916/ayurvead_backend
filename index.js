const express = require('express');
const port = 3000;

const app = express();
const bodyParser = require('body-parser');


 
require('./db');
require('./Modal/User');

const authroutes = require('./Routes/authroutes');


// socket io

// const httpServer = createServer();



app.use(bodyParser.json())  
app.use(authroutes) 





//...........18




// httpServer.listen(3001);


app.listen(port, () => {
    console.log("Server is On");
})