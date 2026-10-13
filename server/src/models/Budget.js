
const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Budget category is required"],
      trim: true,
      enum: [
        "Food",
        "Transport",
        "Housing",
        "Utilities",
        "Shopping",
        "Health",
        "Entertainment",
      ],
    },

    limit: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [0.01, "Budget limit must be greater than zero"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Each user can have only one budget per category.
budgetSchema.index({ owner: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
