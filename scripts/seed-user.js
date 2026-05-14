const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const dbName = process.env.MONGO_DB || process.env.MONGODB_DB || 'reachpilot';

  if (!uri) {
    throw new Error('MONGO_URI is not set in .env.local');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const username = 'virajnuge';
    const email = 'virajnuge@example.com';
    const firstName = 'Viraj';
    const lastName = 'Nuge';
    const password = 'password-password123';

    const hashed = await bcrypt.hash(password, 12);
    const doc = {
      username,
      email,
      firstName,
      lastName,
      password: hashed,
      createdAt: new Date(),
    };

    const existing = await users.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      const result = await users.updateOne(
        { _id: existing._id },
        {
          $set: {
            username,
            email,
            firstName,
            lastName,
            password: hashed,
          },
        }
      );
      console.log('Updated existing user:', existing._id.toString(), 'modifiedCount=', result.modifiedCount);
      return;
    }

    const res = await users.insertOne(doc);
    console.log('Inserted user id:', res.insertedId.toString());
  } catch (err) {
    console.error('Seed error:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
