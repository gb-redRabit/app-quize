const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const events = require("../utils/events");

// Server-Sent Events: zmiany pytań w czasie rzeczywistym.
router.get("/", auth.verifyToken, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(": connected\n\n");

  const onQuestionsChanged = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  events.on("questions-changed", onQuestionsChanged);

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);
  if (typeof heartbeat.unref === "function") heartbeat.unref();

  req.on("close", () => {
    clearInterval(heartbeat);
    events.off("questions-changed", onQuestionsChanged);
    res.end();
  });
});

module.exports = router;
