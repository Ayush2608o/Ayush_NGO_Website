import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs/promises';
import path from 'node:path';
const dbPath=process.env.DB_PATH||path.resolve('./ayush_ngo_db.db');
await fs.mkdir(path.dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);
try{db.exec(await fs.readFile(new URL('../schema.sql',import.meta.url),'utf8'));console.log(`SQLite schema initialized at ${dbPath}. No rows were seeded.`)}finally{db.close()}
