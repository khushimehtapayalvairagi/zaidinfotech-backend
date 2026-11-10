import mongoose from "mongoose";

// Sequential job number ke liye counter
// Ek hi document: _id = "repairJob"

const jobCounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

const JobCounter =
  mongoose.models.JobCounter ||
  mongoose.model("JobCounter", jobCounterSchema);

export default JobCounter;