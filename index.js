import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
// console.log(process.env.PORT);

const app = express();
const PORT = process.env.PORT || 8000;

//Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //1 hour
  max: 100,
  message: "Too many requests from this IP, please try again after 15minutes",
});

//securtiy middleware
app.use("/api", limiter);
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(hpp());

//loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//body parser middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

//Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

//CORS configuration

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    creadedentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
      "Origin",
      "X-Requested-With",
      "Accept",
      "device-remember-token",
    ],
  }),
);

//API routes

app.use((req, res) => {
  res.status(404).json({
    status: error,
    message: "Page Not Found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
