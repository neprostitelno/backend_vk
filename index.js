const express = require("express");
const fileUpload = require('express-fileupload');
const dotenv = require("dotenv")
dotenv.config()
const userRouter = require('./Routes/User.routes')
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 3001;

const app = express();

app.use(fileUpload({}));
app.use('/public', express.static('public'))
app.use(express.json())
app.use(cookieParser());
app.use('/api', userRouter)


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
