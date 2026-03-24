import dotenv from "dotenv";
import AppError from "../app/errorHelpers/AppError";
import status from "http-status";

dotenv.config();

interface IEnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  FRONTEND_URL: string;
}

const loadEnvVariables = (): IEnvConfig => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "FRONTEND_URL",
  ];

  requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
      throw new AppError(
        status.BAD_REQUEST,
        `Missing environment variable: ${envVariable}`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};

const envVars = loadEnvVariables();
export default envVars;
