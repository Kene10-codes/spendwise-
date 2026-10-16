const express = require("express");
const mongoose = require("mongoose");

const Budget = require("../models/Budget");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Convert MongoDB documents to the shape expected by the React UI.
function formatBudget(budget) {
  return {
    id: budget._id.toString(),
    category: budget.category,
    limit: budget.limit,
  };
}

// GET /api/budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({
      owner: req.user.id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: budgets.map(formatBudget),
    });
  } catch (error) {
    console.error("Failed to load budgets:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load budgets.",
    });
  }
});

// POST /api/budgets
router.post("/", async (req, res) => {
  try {
    const { category, limit } = req.body;
    const numericLimit = Number(limit);

    const allowedCategories = [
      "Food",
      "Transport",
      "Housing",
      "Utilities",
      "Shopping",
      "Health",
      "Entertainment",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid budget category.",
      });
    }

    if (
      limit === "" ||
      limit === null ||
      limit === undefined ||
      !Number.isFinite(numericLimit) ||
      numericLimit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget limit must be greater than zero.",
      });
    }

    const budget = await Budget.create({
      category,
      limit: numericLimit,
      owner: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Budget created successfully.",
      data: formatBudget(budget),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already have a budget for this category.",
      });
    }

    console.error("Failed to create budget:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create budget.",
    });
  }
});

/**
 * PATCH /api/budgets/:id
 * Update an existing budget's spending limit.
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID.",
      });
    }

    const numericLimit = Number(limit);

    if (
      limit === "" ||
      limit === null ||
      limit === undefined ||
      !Number.isFinite(numericLimit) ||
      numericLimit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget limit must be greater than zero.",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: id,
        owner: req.user.id,
      },
      {
        $set: { limit: numericLimit },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully.",
      data: formatBudget(budget),
    });
  } catch (error) {
    console.error("Failed to update budget:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update budget.",
    });
  }
});

// DELETE /api/budgets/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID.",
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully.",
      data: { id: budget._id.toString() },
    });
  } catch (error) {
    console.error("Failed to delete budget:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete budget.",
    });
  }
});

module.exports = router;
