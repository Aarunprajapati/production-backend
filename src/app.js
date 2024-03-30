import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(express.urlencoded({
    limit: "16kb",
  })
);
app.use(cookieParser());

// Router Import
import userRouter from './routes/user.routes.js'

// router decleration
app.use('/api/v2/user', userRouter) 
// http://localhost:8000/api/v2/user/register

export { app };
