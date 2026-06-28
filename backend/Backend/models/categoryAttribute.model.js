const mongoose = require("mongoose");

const categoryAttributesSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  attributes: [
    {
      name: String,
      type: {
        type: String,
        enum: ["string", "number", "boolean", "date", "array"],
      },
      isSelectable: Boolean,
      required: Boolean,
    },
  ],
});

module.exports = mongoose.model("CategoryAttribute", categoryAttributesSchema);
