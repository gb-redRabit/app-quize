require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression"); // <-- 1. Dodaj import
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRouter = require("./routes/users");
const connectDB = require("./config/database");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Dodaj obsługę CORS
app.use(
  cors({
    origin: [
      "https://quize-tawny.vercel.app",
      "http://localhost:3000",
      "https://quize-nnjdhzbym-grzegorzs-projects-7e242f51.vercel.app",
      "https://quize-git-main-grzegorzs-projects-7e242f51.vercel.app",
      "https://quiz-app-rysh.onrender.com",
    ],
    credentials: true,
    exposedHeaders: ["Content-Disposition"], // jeśli eksportujesz pliki
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Obsłuż preflight OPTIONS (nie zawsze wymagane, ale na Render czasem pomaga)
app.options("*", cors());

// <-- 2. Dodaj middleware do kompresji z warunkiem
app.use(
  compression({
    filter: (req, res) => {
      // Nie kompresuj, jeśli to żądanie eksportu do Excela
      if (req.path.includes("/export/excel")) {
        return false;
      }
      // W przeciwnym razie, użyj domyślnego progu kompresji
      return compression.filter(req, res);
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRouter);

connectDB(); // Dodaj to przed app.listen

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
