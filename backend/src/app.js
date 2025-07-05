require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// RĘCZNE ustawianie nagłówków CORS dla każdej odpowiedzi
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://quize-nnjdhzbym-grzegorzs-projects-7e242f51.vercel.app",
    "https://quize-git-main-grzegorzs-projects-7e242f51.vercel.app",
    "https://quiz-app-rysh.onrender.com",
    "https://quize-tawny.vercel.app",
    "http://localhost:8080",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Expose-Headers", "Content-Disposition"); // <-- DODAJ TO
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
