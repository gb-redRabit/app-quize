const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const questionsRoutes = require("./routes/questions");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
