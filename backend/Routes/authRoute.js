const router = require("express").Router();
const auth = require("../Controller/authController");
const { authenticate, requireRole } = require("../Middleware/authenticate");

// public
router.post("/login", auth.login);

// any logged-in user
router.get("/me", authenticate, auth.me);

// admin only - host management
router.post("/hosts", authenticate, requireRole("admin"), auth.createHost);
router.get("/hosts", authenticate, requireRole("admin"), auth.getHosts);
router.get("/hosts/:id", authenticate, requireRole("admin"), auth.getHostById);
router.put("/hosts/:id", authenticate, requireRole("admin"), auth.updateHost);
router.patch("/hosts/:id/status", authenticate, requireRole("admin"), auth.setHostStatus);
router.delete("/hosts/:id", authenticate, requireRole("admin"), auth.deleteHost);

module.exports = router;