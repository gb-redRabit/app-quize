const Agenda = require("agenda");

const mongoConnectionString = process.env.MONGO_URI;

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: "agendaJobs" },
  processEvery: "5 seconds",
  maxConcurrency: 5,
});

module.exports = agenda;
