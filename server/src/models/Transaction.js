const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Transaction title is required"],
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
    },

    date: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Transaction", transactionSchema);
