// Local diagnostic-only script: prints redacted LinkedIn connection documents from MongoDB.
// Usage: node scripts/inspect_linkedin_connection.js

require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in .env.local');
    process.exit(1);
  }

  // Note: modern `mongodb` drivers don't accept the `useUnifiedTopology` option.
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const col = db.collection('social_connections');

    const docs = await col.find({ platform: 'linkedin' }).toArray();
    console.log(`Found ${docs.length} LinkedIn connection(s)`);
    for (const d of docs) {
      console.log('---');
      console.log('userId:', d.userId);
      console.log('accountId:', d.accountId);
      console.log('platformUserId:', d.platformUserId);
      console.log('platformUsername:', d.platformUsername);
      console.log('accessToken:', d.accessToken ? '[REDACTED]' : 'missing');
      console.log('refreshToken:', d.refreshToken ? '[REDACTED]' : 'missing');
      console.log('tokenExpiresAt:', d.tokenExpiresAt);
      console.log('updatedAt:', d.updatedAt);
    }

    if (docs.length === 0) console.log('No LinkedIn connections found.');
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    process.exit(2);
  } finally {
    await client.close();
  }
}

run();
