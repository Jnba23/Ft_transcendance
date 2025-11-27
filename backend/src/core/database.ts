import Database, { type Database as SQLiteDatabase } from 'better-sqlite3';
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare module 'fastify' {
    interface FastifyInstance {
        db: SQLiteDatabase;
    }
}

async function databasePlugin(fastify: FastifyInstance, opt: any) {
    const dbDir = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'app.db');
    const db = new Database(dbPath);

    db.pragma('foreign_keys = ON');

    const schema = fs.readFileSync(path.join(__dirname, '/db/schema.sql'), 'utf-8');

    db.exec(schema);

    fastify.decorate('db', db);

    fastify.addHook('onClose', async (instanse: FastifyInstance) => {
        instanse.db.close();
    })
}

export default fastifyPlugin(databasePlugin, {
    name: 'Database'
});