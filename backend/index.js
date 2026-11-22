import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import analyticsRoute from "./routes/analytics.route.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const allowedOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .map((origin) => origin.replace(/\/+$/, ''))
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
            return callback(null, true);
        }

        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials:true
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/analytics", analyticsRoute);



const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running at port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exitCode = 1;
    }
};

startServer();

