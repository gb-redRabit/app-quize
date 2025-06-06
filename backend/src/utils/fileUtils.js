const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../../data/data.json');
const usersFilePath = path.join(__dirname, '../../data/users.json');

const readJSONFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
};

const writeJSONFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

const getQuestions = () => {
    return readJSONFile(dataFilePath);
};

const saveQuestions = (questions) => {
    return writeJSONFile(dataFilePath, questions);
};

const getUsers = () => {
    return readJSONFile(usersFilePath);
};

const saveUsers = (users) => {
    return writeJSONFile(usersFilePath, users);
};

module.exports = {
    getQuestions,
    saveQuestions,
    getUsers,
    saveUsers,
};