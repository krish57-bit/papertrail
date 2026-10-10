import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10_000,
  });
  console.log(`[db] connected: ${mongoose.connection.name}`);
}

export function disconnectDB() {
  return mongoose.disconnect();
}
