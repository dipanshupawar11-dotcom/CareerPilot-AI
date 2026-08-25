const express = require("express");

const router = express.Router();

// =========================================================
// CAREER ROADMAP TEST ROUTE
// =========================================================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Career Roadmap routes are working",
  });
});

module.exports = router;