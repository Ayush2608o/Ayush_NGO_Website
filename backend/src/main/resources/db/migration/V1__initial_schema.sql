CREATE TABLE user_accounts (
    id BINARY(16) NOT NULL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NULL,
    phone VARCHAR(40) NULL,
    address VARCHAR(500) NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(16) NOT NULL DEFAULT 'USER',
    google_subject VARCHAR(128) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_user_email UNIQUE (email),
    CONSTRAINT uq_user_google_subject UNIQUE (google_subject),
    CONSTRAINT ck_user_role CHECK (role IN ('USER', 'ADMIN'))
);

CREATE TABLE auth_tokens (
    id BINARY(16) NOT NULL PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    token_type VARCHAR(24) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    used_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_auth_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_auth_token_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    INDEX ix_auth_token_user_type (user_id, token_type),
    INDEX ix_auth_token_expiry (expires_at)
);

CREATE TABLE donations (
    id BINARY(16) NOT NULL PRIMARY KEY,
    user_id BINARY(16) NULL,
    donor_name VARCHAR(120) NOT NULL,
    donor_email VARCHAR(254) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    frequency VARCHAR(16) NOT NULL,
    project_name VARCHAR(120) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING_PAYMENT',
    provider_reference VARCHAR(160) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    paid_at TIMESTAMP(6) NULL,
    refunded_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_donation_user FOREIGN KEY (user_id) REFERENCES user_accounts(id),
    CONSTRAINT uq_donation_provider_ref UNIQUE (provider_reference),
    CONSTRAINT ck_donation_amount CHECK (amount > 0),
    CONSTRAINT ck_donation_status CHECK (status IN ('PENDING_PAYMENT','SUCCEEDED','FAILED','CANCELLED','REFUNDED')),
    CONSTRAINT ck_donation_frequency CHECK (frequency IN ('ONE_TIME','MONTHLY')),
    INDEX ix_donation_user_created (user_id, created_at),
    INDEX ix_donation_status_created (status, created_at),
    INDEX ix_donation_project_status (project_name, status)
);

CREATE TABLE payment_events (
    id BINARY(16) NOT NULL PRIMARY KEY,
    provider_event_id VARCHAR(180) NOT NULL,
    donation_id BINARY(16) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    received_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_payment_event UNIQUE (provider_event_id),
    CONSTRAINT fk_payment_event_donation FOREIGN KEY (donation_id) REFERENCES donations(id),
    INDEX ix_payment_event_donation (donation_id)
);

CREATE TABLE contact_messages (
    id BINARY(16) NOT NULL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX ix_contact_email_created (email, created_at)
);

CREATE TABLE newsletter_subscribers (
    id BINARY(16) NOT NULL PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_newsletter_email UNIQUE (email)
);

CREATE TABLE volunteer_applications (
    id BINARY(16) NOT NULL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    skill VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
