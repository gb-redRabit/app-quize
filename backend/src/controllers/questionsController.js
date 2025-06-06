const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, '../../data/data.json');
const usersFilePath = path.join(__dirname, '../../data/users.json');

const readDataFile = () => {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
};

const writeDataFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

const readUsersFile = () => {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
};

const writeUsersFile = (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

const getAllQuestions = (req, res) => {
    const questions = readDataFile();
    res.json(questions);
};

const addQuestion = (req, res) => {
    const questions = readDataFile();
    const newQuestion = req.body;
    questions.push(newQuestion);
    writeDataFile(questions);
    res.status(201).json(newQuestion);
};

const updateQuestion = (req, res) => {
    const questions = readDataFile();
    const { id } = req.params;
    const index = questions.findIndex(q => q.id === parseInt(id));
    if (index !== -1) {
        questions[index] = { ...questions[index], ...req.body };
        writeDataFile(questions);
        res.json(questions[index]);
    } else {
        res.status(404).send('Question not found');
    }
};

const deleteQuestion = (req, res) => {
    const questions = readDataFile();
    const { id } = req.params;
    const index = questions.findIndex(q => q.id === parseInt(id));
    if (index !== -1) {
        const deletedQuestion = questions.splice(index, 1);
        writeDataFile(questions);
        res.json(deletedQuestion);
    } else {
        res.status(404).send('Question not found');
    }
};

module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
};