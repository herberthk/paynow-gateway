import "dotenv/config";
import { createPrismaPostgresHttpClient } from "@prisma/studio-core/data/ppg";
import { serializeError } from "@prisma/studio-core/data/bff";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Change to your domain in production
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Use dynamic rendering for database operations
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { message: "Studio API endpoint is running" },
    { headers: CORS_HEADERS },
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query;

    if (!query) {
      return Response.json([serializeError(new Error("Query is required"))], {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const url = process.env.DATABASE_URL;
    if (!url) {
      const message = "❌ Environment variable DATABASE_URL is missing.";
      return Response.json([serializeError(new Error(message))], {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    // Execute query using PostgreSQL
    const [error, results] = await createPrismaPostgresHttpClient({
      url,
    }).execute(query);

    if (error) {
      return Response.json([serializeError(error)], {
        headers: CORS_HEADERS,
      });
    }

    return Response.json([null, results], { headers: CORS_HEADERS });
  } catch (err) {
    return Response.json([serializeError(err)], {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
