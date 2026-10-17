const express = require("express");
const router = express.Router();
const {
  login,
  createHost,
  getHosts,
  setHostStatus,
  me,
} = require("../Controller/authController");
const { authenticate, authorize } = require("../Middleware/authenticate");

router.post("/login", login);
router.get("/me", authenticate, me);

// Admin only
router.post("/hosts", authenticate, authorize("admin"), createHost);
router.get("/hosts", authenticate, authorize("admin"), getHosts);
router.patch("/hosts/:id/status", authenticate, authorize("admin"), setHostStatus);

module.exports = router;