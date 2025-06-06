# Quiz Application

## Overview
This project is a quiz application built using Vue.js for the frontend and Node.js for the backend. It allows users to take quizzes, manage questions, and view their quiz history. The application features user authentication, a responsive design using Tailwind CSS, and a timed quiz option.

## Features
- User authentication (login and registration)
- Quiz functionality with random questions
- Ability to add, edit, and delete quiz questions
- User history tracking
- Responsive design with Tailwind CSS
- Countdown timer for quizzes

## Project Structure
```
quiz-app
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── routes
│   │   │   ├── auth.js
│   │   │   ├── questions.js
│   │   │   └── users.js
│   │   ├── controllers
│   │   │   ├── authController.js
│   │   │   ├── questionsController.js
│   │   │   └── usersController.js
│   │   ├── middleware
│   │   │   └── authMiddleware.js
│   │   └── utils
│   │       └── fileUtils.js
│   ├── data
│   │   ├── data.json
│   │   └── users.json
│   ├── package.json
│   └── README.md
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   │   ├── Quiz.vue
│   │   │   ├── QuestionEditor.vue
│   │   │   ├── Login.vue
│   │   │   ├── History.vue
│   │   │   └── Timer.vue
│   │   ├── views
│   │   │   ├── Home.vue
│   │   │   ├── QuizView.vue
│   │   │   ├── AdminView.vue
│   │   │   └── NotFound.vue
│   │   ├── router
│   │   │   └── index.js
│   │   ├── store
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- npm
- Vue CLI

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the backend directory and install dependencies:
   ```
   cd backend
   npm install
   ```
3. Navigate to the frontend directory and install dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application
1. Start the backend server:
   ```
   cd backend
   npm start
   ```
2. Start the frontend application:
   ```
   cd frontend
   npm run serve
   ```

### Usage
- Access the application in your browser at `http://localhost:8080`.
- Use the login functionality to access user-specific features.
- Take quizzes and manage questions if you have admin privileges.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.# app-quize
