const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// Obsługa preflight dla wszystkich tras (musi być przed innymi middleware!)
app.options("*", cors());

app.use(
  cors({
    origin: [
      "https://quize-nnjdhzbym-grzegorzs-projects-7e242f51.vercel.app",
      "https://quize-git-main-grzegorzs-projects-7e242f51.vercel.app",
      "https://quiz-app-rysh.onrender.com",
      "https://quize-tawny.vercel.app",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
