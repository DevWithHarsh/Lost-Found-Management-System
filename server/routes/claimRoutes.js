const express = require("express");

const {
  createClaimRequest,
  getMyClaims,
  getPendingClaims,
  approveClaim,
  rejectClaim,
} = require("../controllers/claimController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createClaimRequest);
router.get("/my", protect, getMyClaims);

router.get("/admin/pending", protect, adminOnly, getPendingClaims);
router.patch("/admin/:id/approve", protect, adminOnly, approveClaim);
router.patch("/admin/:id/reject", protect, adminOnly, rejectClaim);

module.exports = router;
