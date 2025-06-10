const fs = require("fs").promises;
const path = require("path");

const dataFilePath = path.join(__dirname, "../../data/data.json");
const usersFilePath = path.join(__dirname, "../../data/users.json");

async function readJson(filePath) {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

async function writeJson(filePath, obj) {
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2), "utf8");
}

module.exports = {
  readJson,
  writeJson,
  getQuestions: () => readJson(dataFilePath),
  saveQuestions: (questions) => writeJson(dataFilePath, questions),
  getUsers: () => readJson(usersFilePath),
  saveUsers: (users) => writeJson(usersFilePath, users),
  dataFilePath,
  usersFilePath,
};
