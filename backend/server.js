const express = require("express");
const cors = require("cors");
require('dotenv').config();

const authRoutes = require("./Routes/authRoute");


const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
 
app.use("/auth", authRoutes);



app.listen(PORT, ()=>{
    console.log(`Server Running on Port ${PORT}`);
});
