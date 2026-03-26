import { Server } from "node:http";
import app from "./app";
import envVars from "./config/env";
import { prisma } from "./app/lib/prisma";

let server: Server;

async function main() {
  try {
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.log("Failed to start the server: ",err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();


process.on('unhandledRejection', async (err) => {
  console.log(`😈 Unhandled Rejection detected, shutting down...`, err);
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    await prisma.$disconnect();
    process.exit(1);
  }
});

process.on('uncaughtException', async (err) => {
  console.log(`😈 Uncaught Exception detected, shutting down...`, err);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle SIGTERM (e.g., from Docker or cloud platforms)
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log('👋 Server closed');
      process.exit(0);
    });
  }
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log('👋 Server closed');
      process.exit(0);
    });
  }
});