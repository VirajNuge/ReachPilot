const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

function getArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function usage() {
  console.error(
    'Usage: node scripts/seed-user.js --username <username> --email <email> --first-name <first name> --last-name <last name> --password <password>',
  );
}

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

    const username = getArgument('--username') || process.env.SEED_USERNAME;
    const email = getArgument('--email') || process.env.SEED_EMAIL;
    const firstName = getArgument('--first-name') || process.env.SEED_FIRST_NAME;
    const lastName = getArgument('--last-name') || process.env.SEED_LAST_NAME;
    const password = getArgument('--password') || process.env.SEED_PASSWORD;

    if (!username || !email || !firstName || !lastName || !password) {
      usage();
      throw new Error('All seed-user identity and password values are required.');
    }

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
