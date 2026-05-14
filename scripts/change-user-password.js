#!/usr/bin/env node
/**
 * change-user-password.js
 *
 * Usage:
 *   # from repo root
 *   node reachpilot/scripts/change-user-password.js --username "SPA CEYLON" --password "spaceylon123"
 *
 * The script loads reachpilot/.env.local if present (via dotenv) or reads MONGO_URI from environment.
 * It hashes the provided password using bcrypt and updates the user's password field.
 */

const path = require('path');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

function usageAndExit(code = 1) {
  console.error('\nUsage: node reachpilot/scripts/change-user-password.js --username "<username>" --password "<newPassword>"\n');
  process.exit(code);
}

// Simple argv parser (no extra deps)
const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--username' || a === '-u') args.username = argv[++i];
  else if (a === '--password' || a === '-p') args.password = argv[++i];
  else if (a === '--help' || a === '-h') usageAndExit(0);
}

if (!args.username || !args.password) {
  usageAndExit();
}

// Load .env.local from reachpilot if present
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = process.env.MONGO_DB || process.env.MONGODB_DB || 'reachpilot';

if (!MONGO_URI) {
  console.error('Error: MONGO_URI not found. Set reachpilot/.env.local or export MONGO_URI in your environment.');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    console.log(`Looking up user by username: "${args.username}"`);
    const user = await users.findOne({ username: args.username });
    if (!user) {
      console.error('User not found. Aborting.');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(args.password, 12);

    const res = await users.updateOne({ _id: user._id }, { $set: { password: hashed } });
    if (res.modifiedCount === 1) {
      console.log(`Password updated for user ${args.username} (id=${user._id.toString()})`);
    } else {
      console.warn('Update completed but modifiedCount !== 1. Check the database state.');
    }
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
