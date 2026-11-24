const mongoose = require("mongoose");

/**
 * Wersja bazy pytań — używana przez PWA do decydowania, czy odświeżyć cache.
 */
const metaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    version: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "meta", versionKey: false }
);

module.exports = mongoose.model("Meta", metaSchema);
