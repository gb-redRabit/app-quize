const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// --- DODAJ TĘ KONFIGURACJĘ ---
app.use(
  cors({
    origin: [
      "https://quize-nnjdhzbym-grzegorzs-projects-7e242f51.vercel.app",
      "https://quize-nnjdhzbym-grzegorzs-projects-7e242f51.vercel.app/login",
      "https://quize-git-main-grzegorzs-projects-7e242f51.vercel.app/login",
      "https://quize-git-main-grzegorzs-projects-7e242f51.vercel.app",
      "https://quiz-app-rysh.onrender.com",
      "https://quize-tawny.vercel.app",
      "https://quize-tawny.vercel.app/login",
      "http://localhost:8080",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
// ----------------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
