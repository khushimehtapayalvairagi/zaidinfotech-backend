import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    // ==========================================
    // HOLIDAY NAME
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // DATE
    // ==========================================

    date: {
      type: Date,
      required: true,
      index: true,
    },

    // ==========================================
    // TYPE
    // ==========================================

    holidayType: {
      type: String,
      enum: [
        "PERMANENT",
        "SPECIAL",
      ],
      default: "SPECIAL",
    },

    // ==========================================
    // DESCRIPTION
    // ==========================================

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ACTIVE
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // CREATED BY
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

holidaySchema.index({
  date: 1,
  isActive: 1,
});

const Holiday = mongoose.model(
  "Holiday",
  holidaySchema
);

export default Holiday;