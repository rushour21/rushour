import mongoose from "mongoose";

/**
 * Cached on globalThis deliberately. Without this, Next.js hot reload opens a
 * fresh connection on every module reload and Atlas rate-limits the project
 * within an hour of development.
 */
declare global {
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and set it.",
    );
  }

  if (!cached.promise) {
    // A short timeout matters in serverless: the driver's 30s default can
    // run right up against the platform's own function timeout, turning an
    // unreachable database into a slow, opaque 500 instead of a fast,
    // diagnosable one.
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // A failed attempt must not stick around as "the" cached promise - every
    // call after a transient outage (Mongo not started yet, a restart) would
    // otherwise keep re-awaiting the same already-rejected promise forever,
    // even once the database is actually reachable again.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
