const mongoose = require("mongoose");

const categoryStatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema({
  totalQuestions: { type: Number, default: 0 },
  categories: { type: [categoryStatSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const Stats = mongoose.model("Stats", statsSchema);

// --- Autoaktualizacja co 20 minut ---
const Question = require("./Question");
async function updateStats() {
  const totalQuestions = await Question.countDocuments();
  const categoriesAgg = await Question.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const categories = categoriesAgg.map((cat) => ({
    name: cat._id,
    count: cat.count,
  }));

  await Stats.findOneAndUpdate(
    {},
    {
      totalQuestions,
      categories,
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}

// Uruchom co 20 minut
setInterval(updateStats, 20 * 60 * 1000);

module.exports = Stats;
