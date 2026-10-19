require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");

require("./Controller/authController").seedAdmin();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/auth", require("./Routes/authRoute"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/ads", require("./Routes/advRoute"));

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});