import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';
const email=String(process.env.BOOTSTRAP_ADMIN_EMAIL||'').trim().toLowerCase();
const password=String(process.env.BOOTSTRAP_ADMIN_PASSWORD||'');
const name=String(process.env.BOOTSTRAP_ADMIN_NAME||'').trim();
if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||password.length<12||password.length>72){console.error('Set BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, and a BOOTSTRAP_ADMIN_PASSWORD of 12–72 characters for this one-time command.');process.exit(1)}
if(!process.env.DB_PATH)throw new Error('DB_PATH is missing from the local backend config.');
const db=new DatabaseSync(process.env.DB_PATH);
try { const {count}=db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='ADMIN'").get();if(count){throw new Error('An administrator already exists; bootstrap can only create the first administrator.')};db.prepare("INSERT INTO users(full_name,email,password_hash,role) VALUES(?,?,?,'ADMIN')").run(name,email,await bcrypt.hash(password,12));console.log(`Administrator created for ${email}. Remove bootstrap variables immediately.`); } finally {db.close()}
