import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Football",
        "Volleyball",
        "Basketball",
        "Kabaddi",
        "Badminton",
        "Chess",
        "Kho Kho",
        "Table Tennis",
        "Tug of War",
        "Cricket",
        "Athletics",
        "Events",
        "Celebrations",
        "Other",
      ],
    },
    description: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export const Gallery = mongoose.model("Gallery", gallerySchema);
