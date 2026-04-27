import mongoose from 'mongoose';

type MongooseGlobal = {
  _mongo?: {
    conn: null | typeof mongoose;
    promise: Promise<typeof mongoose> | null;
  };
} & typeof globalThis;

const g = globalThis as MongooseGlobal;

if (!g._mongo) {
  g._mongo = { conn: null, promise: null };
}

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  if (g._mongo!.conn) {
    return g._mongo!.conn;
  }
  if (!g._mongo!.promise) {
    g._mongo!.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  g._mongo!.conn = await g._mongo!.promise;
  return g._mongo!.conn;
}
