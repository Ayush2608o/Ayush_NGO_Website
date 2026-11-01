PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 full_name TEXT NOT NULL CHECK(length(full_name) BETWEEN 2 AND 120),
 email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 password_hash TEXT NOT NULL,
 phone TEXT NULL CHECK(phone IS NULL OR length(phone)<=40),
 address TEXT NULL CHECK(address IS NULL OR length(address)<=500),
 profile_image TEXT NULL,
 role TEXT NOT NULL DEFAULT 'USER' CHECK(role IN ('USER','ADMIN')),
 account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(account_status IN ('ACTIVE','DISABLED')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_users_created ON users(created_at);

CREATE TABLE IF NOT EXISTS donations (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id),
 donor_name TEXT NOT NULL, donor_email TEXT NOT NULL,
 amount NUMERIC NOT NULL CHECK(amount>0),
 transaction_reference TEXT NOT NULL UNIQUE,
 payment_screenshot TEXT NULL,
 payment_method TEXT NOT NULL DEFAULT 'UPI',
 status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','VERIFIED','REJECTED')),
 admin_note TEXT NULL CHECK(admin_note IS NULL OR length(admin_note)<=1000),
 verified_by INTEGER NULL REFERENCES users(id), verified_at TEXT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_donations_user_created ON donations(user_id,created_at);
CREATE INDEX IF NOT EXISTS ix_donations_status_created ON donations(status,created_at);

CREATE TABLE IF NOT EXISTS payment_settings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 upi_id TEXT NULL, qr_image_path TEXT NULL, account_holder_name TEXT NULL,
 instructions TEXT NULL, updated_by INTEGER NULL REFERENCES users(id),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL, description TEXT NOT NULL, image TEXT NULL,
 target_amount NUMERIC NOT NULL DEFAULT 0 CHECK(target_amount>=0),
 status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ARCHIVED')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_projects_status_created ON projects(status,created_at);

CREATE TABLE IF NOT EXISTS volunteers (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
 full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
 skills TEXT NULL, availability TEXT NULL,
 application_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(application_status IN ('PENDING','APPROVED','REJECTED')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_volunteers_status_created ON volunteers(application_status,created_at);

CREATE TABLE IF NOT EXISTS contact_messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','CLOSED')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_contact_status_created ON contact_messages(status,created_at);
CREATE INDEX IF NOT EXISTS ix_contact_email ON contact_messages(email);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','UNSUBSCRIBED')),
 subscribed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_newsletter_status ON newsletter_subscribers(status);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 admin_id INTEGER NOT NULL REFERENCES users(id),
 action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id INTEGER NULL,
 details TEXT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_adminlog_admin_created ON admin_activity_logs(admin_id,created_at);
CREATE INDEX IF NOT EXISTS ix_adminlog_entity ON admin_activity_logs(entity_type,entity_id);

CREATE TABLE IF NOT EXISTS sessions (
 session_id TEXT PRIMARY KEY, expires INTEGER NOT NULL, data TEXT NULL
);
CREATE INDEX IF NOT EXISTS ix_session_expiry ON sessions(expires);
