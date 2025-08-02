import express from "express";
import "dotenv/config";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import helmet from "helmet"

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Security middleware to set various HTTP headers

// Routes
app.use("/api/auth", authRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

