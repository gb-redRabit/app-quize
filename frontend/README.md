# Quiz App

## Overview

This project is a quiz application built with Vue.js for the frontend and Node.js for the backend. It allows users to take quizzes, manage questions, and view their quiz history. The application features user authentication and a responsive design using Tailwind CSS.

## Features

- User authentication (login and registration)
- Quiz functionality with a random selection of questions
- Timer for timed quizzes
- Admin panel for managing quiz questions
- User history tracking
- Responsive design

## Technologies Used

- **Frontend**: Vue.js, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: JSON files for storing questions and user data

## Project Structure

```
quiz-app
├── backend
│   ├── src
│   ├── data
│   ├── package.json
│   └── README.md
├── frontend
│   ├── src
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd quiz-app
   ```

2. Install backend dependencies:

   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
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

3. Open your browser and navigate to `http://localhost:8080` to access the application.

## Usage

- Users can log in or register to access the quiz features.
- Admin users can manage quiz questions through the admin panel.
- Users can view their quiz history after completing quizzes.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
