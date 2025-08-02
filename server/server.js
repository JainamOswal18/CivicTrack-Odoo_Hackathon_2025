import express from "express";
import "dotenv/config";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import issueRoutes from "./routes/issues.js";
import adminRoutes from "./routes/admin.js";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration - Allow requests from frontend
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000", // Common alternative port
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
};

app.use(cors(corsOptions));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Security middleware to set various HTTP headers

// Routes

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));


app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

