const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const HealthRoutes = require("./routes/Health.routes");
const authRoutes = require("./routes/Auth.routes");
const docRoutes = require("./routes/Document.route");

dotenv.config({ quiet: true });
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/health", HealthRoutes);

app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(
        `Server running on port ${
          (process.env.PORT || 5000,
          " http://localhost:" + (process.env.PORT || 5000))
        }`
      )
    );
  })
  .catch((err) => console.error(err));
