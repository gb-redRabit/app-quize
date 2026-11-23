require("dotenv").config();

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error(
    "Brak wymaganych zmiennych środowiskowych: JWT_SECRET i MONGO_URI"
  );
  process.exit(1);
}

const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression"); // <-- 1. Dodaj import
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRouter = require("./routes/users");
const statsRoutes = require("./routes/stats");
const connectDB = require("./config/database");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

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

// RĘCZNE ustawianie nagłówków CORS dla każdej odpowiedzi
app.use((req, res, next) => {
  const defaultOrigins = [
    "https://quize-nnjdhzbym-grzegorzs-projects-7e242f51.vercel.app",
    "https://quize-git-main-grzegorzs-projects-7e242f51.vercel.app",
    "https://quiz-app-rysh.onrender.com",
    "https://quize-tawny.vercel.app",
    "http://localhost:8080",
  ];
  const extraOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];
  // Ustaw nagłówki CORS dla każdej odpowiedzi
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Max-Age", "86400");
  res.header("Access-Control-Expose-Headers", "Content-Disposition, X-Total-Count"); // <-- DODAJ TO
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Dodaj globalny middleware PRZED obsługą tras API
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Publiczny health check (używany m.in. do keep-alive na Render Free)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRouter);
app.use("/api/stats", statsRoutes);

(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
