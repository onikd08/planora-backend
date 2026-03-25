import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import envVars from "./config/env";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// application routes

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello from Planora-Backend");
});

// not-found
app.use(notFound);

// global error handler
app.use(globalErrorHandler);

export default app;
