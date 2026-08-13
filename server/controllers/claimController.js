const ClaimRequest = require("../models/ClaimRequest");
const FoundItem = require("../models/FoundItem");

// =========================
// SUBMIT CLAIM REQUEST
// =========================
const createClaimRequest = async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    if (!itemId || !reason?.trim()) {
      return res.status(400).json({
        message: "Item and claim reason are required",
      });
    }

    const item = await FoundItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Found item not found",
      });
    }

    if (item.status !== "available") {
      return res.status(400).json({
        message: "This item is no longer available for claiming",
      });
    }

    if (item.reportedBy.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot claim an item that you reported",
      });
    }

    const existingClaim = await ClaimRequest.findOne({
      foundItem: itemId,
      claimant: req.user.id,
      status: "pending",
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "You already have a pending claim for this item",
      });
    }

    const claim = await ClaimRequest.create({
      foundItem: itemId,
      claimant: req.user.id,
      reason: reason.trim(),
    });

    const populatedClaim = await ClaimRequest.findById(claim._id)
      .populate("foundItem", "name category image status")
      .populate("claimant", "name email phone");

    res.status(201).json({
      message: "Claim request submitted successfully",
      claim: populatedClaim,
    });
  } catch (error) {
    console.error("Create claim request error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// GET MY CLAIM REQUESTS
// =========================
const getMyClaims = async (req, res) => {
  try {
    const claims = await ClaimRequest.find({
      claimant: req.user.id,
    })
      .populate("foundItem", "name category image status")
      .sort({ createdAt: -1 });

    res.json({ claims });
  } catch (error) {
    console.error("Get my claims error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// GET ALL PENDING CLAIM REQUESTS (ADMIN)
// =========================
const getPendingClaims = async (req, res) => {
  try {
    const claims = await ClaimRequest.find({ status: "pending" })
      .populate("foundItem", "name category description location foundDate image status reportedBy")
      .populate("claimant", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ claims });
  } catch (error) {
    console.error("Get pending claims error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// APPROVE CLAIM REQUEST (ADMIN)
// =========================
const approveClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await ClaimRequest.findById(id)
      .populate("foundItem", "name status");

    if (!claim) {
      return res.status(404).json({
        message: "Claim request not found",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "This claim request has already been processed",
      });
    }

    if (!claim.foundItem || claim.foundItem.status !== "available") {
      return res.status(400).json({
        message: "This item is no longer available",
      });
    }

    claim.status = "approved";
    await claim.save();

    await FoundItem.findByIdAndUpdate(claim.foundItem._id, {
      status: "claimed",
    });

    // If there are other pending claims for the same item, reject them.
    await ClaimRequest.updateMany(
      {
        foundItem: claim.foundItem._id,
        _id: { $ne: claim._id },
        status: "pending",
      },
      { status: "rejected" }
    );

    const updatedClaim = await ClaimRequest.findById(claim._id)
      .populate("foundItem", "name category image status")
      .populate("claimant", "name email phone");

    res.json({
      message: "Claim approved successfully",
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Approve claim error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// REJECT CLAIM REQUEST (ADMIN)
// =========================
const rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await ClaimRequest.findById(id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim request not found",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "This claim request has already been processed",
      });
    }

    claim.status = "rejected";
    await claim.save();

    const updatedClaim = await ClaimRequest.findById(claim._id)
      .populate("foundItem", "name category image status")
      .populate("claimant", "name email phone");

    res.json({
      message: "Claim rejected successfully",
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Reject claim error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createClaimRequest,
  getMyClaims,
  getPendingClaims,
  approveClaim,
  rejectClaim,
};
