import Database, { type Database as SQLiteDatabase } from 'better-sqlite3';
import type { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fs from 'fs';
import path from 'path'; // keeping for path.join to create paths
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

declare module 'fastify' {
  interface FastifyInstance {
    db: SQLiteDatabase;
  }
}

async function databasePlugin(fastify: FastifyInstance) {
  const dbDir = path.join(process.cwd(), 'data'); // data directory at project root

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'app.db');
  const db = new Database(dbPath);

  db.pragma('foreign_keys = ON');

  // schema.sql is located in this package under core/db/schema.sql
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  db.exec(schema);

  fastify.decorate('db', db);

  fastify.addHook('onClose', async (instance: FastifyInstance) => {
    instance.db.close();
  });
}

export default fastifyPlugin(databasePlugin, {
  name: 'Database',
});
