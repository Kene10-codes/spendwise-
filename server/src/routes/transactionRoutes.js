const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // Apply authentication middleware to all transaction routes

// GET /api/transactions
// Retrieve all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
    });
  }
});

// GET /api/transactions/:id
// Retrieve one transaction
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction",
    });
  }
});

// POST /api/transactions
// Create a transaction
router.post("/", async (req, res) => {
  try {
    const { title, type, category, amount, date } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      !["income", "expense"].includes(type) ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid title, type, category, amount, and date",
      });
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      type,
      category: category.trim(),
      amount: Number(amount),
      date,
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
});

// PATCH /api/transactions/:id
// Update a transaction
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const allowedFields = ["title", "type", "category", "amount", "date"];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update",
      });
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must not be empty",
      });
    }

    if (
      updates.category !== undefined &&
      (typeof updates.category !== "string" || !updates.category.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Category must not be empty",
      });
    }

    if (
      updates.type !== undefined &&
      !["income", "expense"].includes(updates.type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }

    if (
      updates.amount !== undefined &&
      (updates.amount === null ||
        updates.amount === "" ||
        !Number.isFinite(Number(updates.amount)) ||
        Number(updates.amount) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    if (updates.date !== undefined) {
      const date = updates.date;

      if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
      ) {
        return res.status(400).json({
          success: false,
          message: "Date must be a valid YYYY-MM-DD date",
        });
      }
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim();
    }

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
});

// DELETE /api/transactions/:id
// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
});

module.exports = router;
