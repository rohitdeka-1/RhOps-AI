import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Set up WebSocket for Neon Serverless
neonConfig.webSocketConstructor = ws;

// Initialize the database pool
const connectionString = process.env.DATABASE_URL || '';
console.log("INITIALIZING PRISMA. DATABASE_URL is exactly:", JSON.stringify(connectionString));
// Instantiate the adapter (Prisma v7 takes PoolConfig, not a Pool instance)
const adapter = new PrismaNeon({ connectionString });

// Pass adapter to Prisma Client
export const prisma = new PrismaClient({ adapter });
