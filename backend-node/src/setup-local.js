import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const configPath=process.env.AYUSH_BACKEND_CONFIG;
const dbPath=process.env.AYUSH_DB_PATH;
if(!configPath||!dbPath)throw new Error('Run setup-local.ps1 to configure the local SQLite file.');
try{await fs.access(configPath);throw new Error('A local backend config already exists; run run-backend.ps1 to start the app.')}catch(e){if(e.code!=='ENOENT')throw e}
await fs.mkdir(path.dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);
try{db.exec(await fs.readFile(new URL('../schema.sql',import.meta.url),'utf8'))}finally{db.close()}
const sessionSecret=crypto.randomBytes(48).toString('base64url');
const env=[
  'NODE_ENV=development','PORT=8085','TRUST_PROXY=0',
  'FRONTEND_ORIGIN=http://localhost:5500,http://127.0.0.1:5500,https://ayushngo.netlify.app',
  `DB_PATH="${dbPath.replaceAll('\\','/').replaceAll('"','\\"')}"`,
  `SESSION_SECRET=${sessionSecret}`,'COOKIE_SAME_SITE=lax',
  `UPLOAD_DIR="${(process.env.AYUSH_UPLOAD_DIR||path.join(path.dirname(configPath),'uploads')).replaceAll('\\','/').replaceAll('"','\\"')}"`,''
].join('\n');
await fs.mkdir(path.dirname(configPath),{recursive:true});
await fs.writeFile(configPath,env,{encoding:'utf8',flag:'wx',mode:0o600});
console.log(`SQLite database created at ${dbPath}; schema only, no sample records.`);
