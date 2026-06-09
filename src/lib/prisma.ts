import { PrismaClient } from "@/generated/prisma/client"
import { PrismaMssql } from "@prisma/adapter-mssql"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function parseConnectionString(str: string) {
  // Handle Azure SQL format: Server=tcp:host,port;Database=db;User Id=user;Password=pass;
  const parts = str.split(";").filter(Boolean)
  const params: Record<string, string> = {}
  for (const part of parts) {
    const idx = part.indexOf("=")
    if (idx > 0) params[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim()
  }

  let host = params["server"] || ""
  // Extract host from tcp:host,port or tcp:host
  host = host.replace(/^tcp:/i, "").split(",")[0].trim()

  const portStr = params["server"]?.split(",")[1] || params["port"] || "1433"
  const options: Record<string, boolean> = {
    trustServerCertificate: params["trustservercertificate"]?.toLowerCase() === "true",
    encrypt: params["encrypt"]?.toLowerCase() !== "false",
  }

  return {
    server: host || "localhost",
    port: parseInt(portStr) || 1433,
    database: params["initial catalog"] || params["database"] || "calo_gym",
    user: params["user id"] || params["user"] || "",
    password: params["password"] || "",
    options,
  }
}

function createPrismaClient() {
  const raw = process.env.AZURE_SQL_URL || process.env.DATABASE_URL || ""
  const config = parseConnectionString(raw)
  const adapter = new PrismaMssql(config, { schema: "dbo" })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
