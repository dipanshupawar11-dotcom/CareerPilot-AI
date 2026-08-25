const express = require("express");

const {
  createResume,
  getResume,
  deleteResume,
} = require("../controllers/resumeController");

const router = express.Router();

// =========================================================
// SAVE / UPDATE RESUME
// POST /api/resume
// =========================================================

router.post("/", createResume);

// =========================================================
// GET RESUME
// GET /api/resume?user_id=USER_ID
// =========================================================

router.get("/", getResume);

// =========================================================
// DELETE RESUME
// DELETE /api/resume?user_id=USER_ID
// =========================================================

router.delete("/", deleteResume);

module.exports = router;