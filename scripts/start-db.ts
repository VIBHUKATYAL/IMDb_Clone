import path from 'path';
import net from 'net';
import fs from 'fs';
import pg from 'pg';
// @ts-ignore
import EmbeddedPostgresMod from 'embedded-postgres';

const EmbeddedPostgres = EmbeddedPostgresMod.default || EmbeddedPostgresMod;

const PORT = 5432;
const USER = 'postgres';
const PASSWORD = 'postgres';
const DB_NAME = 'imdb_clone';
const PG_DATA_DIR = path.resolve(process.cwd(), '.pgdata');

function checkPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function ensureDatabaseExists() {
  const client = new pg.Client({
    host: 'localhost',
    port: PORT,
    user: USER,
    password: PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
    if (res.rowCount === 0) {
      console.log(`[Database] Creating database "${DB_NAME}"...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`[Database] Database "${DB_NAME}" created successfully.`);
    } else {
      console.log(`[Database] Database "${DB_NAME}" already exists.`);
    }
  } catch (err) {
    console.warn('[Database] Could not verify/create database directly:', (err as Error).message);
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  const isRunning = await checkPortInUse(PORT);

  if (isRunning) {
    console.log(`[Database] PostgreSQL is already running on port ${PORT}.`);
    await ensureDatabaseExists();
    console.log(`[Database] Ready for connections.`);
    // Keep alive if run directly
    if (process.argv.includes('--keep-alive')) {
      setInterval(() => {}, 10000);
    }
    return;
  }

  console.log(`[Database] Starting embedded PostgreSQL on port ${PORT}...`);
  const embeddedPg = new EmbeddedPostgres({
    databaseDir: PG_DATA_DIR,
    port: PORT,
    user: USER,
    password: PASSWORD,
    persistent: true,
  });

  try {
    const isInitialized = fs.existsSync(path.join(PG_DATA_DIR, 'PG_VERSION'));
    if (!isInitialized) {
      console.log(`[Database] Initializing cluster in ${PG_DATA_DIR}...`);
      await embeddedPg.initialise();
    } else {
      console.log(`[Database] Cluster already initialized in ${PG_DATA_DIR}. Skipping initdb.`);
    }
    await embeddedPg.start();
    console.log(`[Database] Embedded PostgreSQL started successfully on port ${PORT}.`);

    await ensureDatabaseExists();

    const shutdown = async () => {
      console.log('\n[Database] Shutting down embedded PostgreSQL...');
      try {
        await embeddedPg.stop();
        console.log('[Database] PostgreSQL stopped successfully.');
      } catch (err) {
        console.error('[Database] Error stopping PostgreSQL:', err);
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    console.log(`[Database] PostgreSQL is running. Press Ctrl+C to stop.`);
  } catch (err) {
    console.error('[Database] Failed to start PostgreSQL:', err);
    process.exit(1);
  }
}

main();
