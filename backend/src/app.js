require("dotenv").config();

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error(
    "Brak wymaganych zmiennych środowiskowych: JWT_SECRET i MONGO_URI"
  );
  process.exit(1);
}

const express = require("express");
const compression = require("compression"); // <-- 1. Dodaj import
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRouter = require("./routes/users");
const statsRoutes = require("./routes/stats");
const eventsRoutes = require("./routes/events");
const connectDB = require("./config/database");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

// Podstawowe nagłówki bezpieczeństwa (bez dodatkowej zależności).
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  const isHttps =
    req.secure || req.headers["x-forwarded-proto"] === "https";
  if (isHttps) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains"
    );
  }
  next();
});

app.use(
  compression({
    filter: (req, res) => {
      // Nie kompresuj eksportu Excel ani strumienia SSE
      if (
        req.path.includes("/export/excel") ||
        req.path.includes("/api/events")
      ) {
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
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,If-None-Match");
  res.header("Access-Control-Max-Age", "86400");
  res.header(
    "Access-Control-Expose-Headers",
    "Content-Disposition, X-Total-Count, ETag"
  );
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Publiczny health check (używany m.in. do keep-alive na Render Free)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRouter);
app.use("/api/stats", statsRoutes);
app.use("/api/events", eventsRoutes);

// Nieznane trasy API zwracają JSON, nie HTML.
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Nie znaleziono zasobu" });
});

// Spójne odpowiedzi błędów.
app.use((err, req, res, next) => {
  console.error("Nieobsłużony błąd:", err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: "Błąd serwera" });
});

(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
