const agenda = require("./agenda");
const Question = require("../models/Question");
const EventEmitter = require("events");
const jobResults = new EventEmitter();

agenda.define("fetch questions", async (job) => {
  const {
    query = {},
    projection = null,
    options = {},
    method = "find",
    pipeline = [],
  } = job.attrs.data;
  // WALIDACJA skip/limit
  if (options && typeof options === "object") {
    if (options.skip !== undefined) {
      options.skip = Math.max(0, Math.min(options.skip, 17825792));
    }
    if (options.limit !== undefined) {
      options.limit = Math.max(1, Math.min(options.limit, 500));
    }
  }

  let result;
  if (method === "find") {
    result = await Question.find(query, projection, options).lean();
  } else if (method === "findOne") {
    result = await Question.find(query, projection, options).limit(1).lean();
  } else if (method === "countDocuments") {
    result = await Question.countDocuments(query);
  } else if (method === "aggregate") {
    result = await Question.aggregate(pipeline);
  } else {
    throw new Error("Nieobsługiwana metoda: " + method);
  }

  job.attrs.data.result = result;
});

// Nowa wersja: polling na status joba
const waitForJobResult = async (job) => {
  const jobId = job.attrs._id;
  while (true) {
    // Odczekaj 200ms
    await new Promise((r) => setTimeout(r, 200));
    // Pobierz aktualny stan joba
    const freshJob = await agenda.jobs({ _id: jobId });
    if (!freshJob[0]) throw new Error("Job not found");
    const attrs = freshJob[0].attrs;
    if (attrs.failedAt) throw new Error(attrs.failReason || "Job failed");
    if (attrs.lastFinishedAt) {
      // Usuń job po odebraniu wyniku
      await freshJob[0].remove();
      return attrs.data.result;
    }
  }
};

module.exports = { agenda, waitForJobResult };
