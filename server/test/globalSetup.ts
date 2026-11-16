import { MongoMemoryServer } from 'mongodb-memory-server';

// A database for this run only, in memory; the server under test is told
// where it is, and never touches a real one, nor any photo storage, nor
// sends a notification (push.test.ts stands in for the push services)
export default async function setup() {
  const mongo = await MongoMemoryServer.create();
  Object.assign(process.env, {
    NODE_ENV: 'test',
    MONGODB_URI: mongo.getUri(),
    MONGODB_DB: 'alcove-test',
    BLOB_STORE_ID: '',
    BLOB_READ_WRITE_TOKEN: '',
    OPENLIBRARY_CONTACT: '',
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
    VAPID_SUBJECT: '',
  });
  return () => mongo.stop();
}
