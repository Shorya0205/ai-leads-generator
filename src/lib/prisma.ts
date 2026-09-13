import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

// Use WebSockets for Neon serverless — works over port 443 (no port 5432 needed)
if (typeof WebSocket === "undefined") {
  // Node.js environment: use ws package for WebSocket support
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // During build time or before DB configuration, DATABASE_URL may not be set.
    const adapter = new PrismaNeon({ connectionString: "postgresql://build:build@localhost/build" });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
