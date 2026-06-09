import { PrismaClient } from "@/generated/prisma/client"
import { PrismaMssql } from "@prisma/adapter-mssql"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function parseConnectionString(str: string) {
  // Handle Prisma format: sqlserver://host:port;database=db;user=user;password=pass;...
  if (str.startsWith("sqlserver://")) {
    const params: Record<string, string> = {}
    // Split by semicolons
    const parts = str.split(";")
    // First part: sqlserver://user:pass@host:port
    const first = parts[0]
    for (let i = 1; i < parts.length; i++) {
      const eq = parts[i].indexOf("=")
      if (eq > 0) params[parts[i].slice(0, eq).trim().toLowerCase()] = parts[i].slice(eq + 1)
    }
    // Parse the URL part
    const urlPart = first.replace("sqlserver://", "")
    const atIdx = urlPart.lastIndexOf("@")
    let user = "", password = "", host = "localhost", port = 1433
    if (atIdx > 0) {
      const userPass = urlPart.substring(0, atIdx).split(":")
      user = decodeURIComponent(userPass[0] || "")
      password = decodeURIComponent(userPass[1] || "")
      const hp = urlPart.substring(atIdx + 1).split(":")
      host = hp[0]
      port = parseInt(hp[1]) || 1433
    } else {
      const hp = urlPart.split(":")
      host = hp[0]
      port = parseInt(hp[1]) || 1433
    }
    // Override with semicolon params if present
    if (params["user"]) user = params["user"]
    if (params["password"]) password = params["password"]
    if (params["database"]) params["database"] = params["database"]

    return {
      server: host,
      port,
      database: params["database"] || "calo_gym",
      user: user || params["user"] || "",
      password: password || params["password"] || "",
      options: {
        trustServerCertificate: params["trustservercertificate"] !== "false",
        encrypt: params["encrypt"] === "true",
      },
    }
  }

  // Handle Azure SQL format: Server=tcp:host,port;Database=db;User Id=user;Password=pass;
  const parts = str.split(";").filter(Boolean)
  const params: Record<string, string> = {}
  for (const part of parts) {
    const idx = part.indexOf("=")
    if (idx > 0) params[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim()
  }

  let host = (params["server"] || "").replace(/^tcp:/i, "").split(",")[0].trim()
  const portStr = params["server"]?.split(",")[1] || params["port"] || "1433"

  return {
    server: host || "localhost",
    port: parseInt(portStr) || 1433,
    database: params["initial catalog"] || params["database"] || "calo_gym",
    user: params["user id"] || params["user"] || "",
    password: params["password"] || "",
    options: {
      trustServerCertificate: params["trustservercertificate"]?.toLowerCase() !== "false",
      encrypt: params["encrypt"]?.toLowerCase() !== "false",
    },
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
