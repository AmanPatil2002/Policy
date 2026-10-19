const express = require("express");
const router = express.Router();
const { postForm } = require("../Controller/formController");
const { authenticate, authorize } = require("../Middleware/authenticate");

router.post("/", authenticate, authorize("admin", "host"), postForm);

module.exports = router;