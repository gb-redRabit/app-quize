const fs = require("fs");
const queue = [];
let writing = false;

function writeJsonQueued(filePath, data, cb) {
  // Zamiast przekazywać referencję do tego samego obiektu (users),
  // robimy głęboką kopię, by uniknąć nadpisywania przez kolejne żądania
  const dataCopy = JSON.parse(JSON.stringify(data));
  queue.push({ filePath, data: dataCopy, cb });
  processQueue();
}

function processQueue() {
  if (writing || queue.length === 0) return;
  writing = true;
  const { filePath, data, cb } = queue.shift();
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    writing = false;
    if (cb) cb(err);
    // Użyj setImmediate, by nie blokować event loopa przy dużej liczbie żądań
    setImmediate(processQueue);
  });
}

if (queue.length > 1000) {
  console.warn(
    "Uwaga! Kolejka zapisów do users.json jest bardzo długa:",
    queue.length
  );
}

module.exports = { writeJsonQueued };
