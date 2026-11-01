ALTER TABLE contact_messages
    ADD COLUMN phone VARCHAR(40) NULL AFTER email;

ALTER TABLE volunteer_applications
    ADD COLUMN state VARCHAR(120) NULL AFTER city,
    ADD COLUMN age SMALLINT UNSIGNED NULL AFTER state,
    ADD COLUMN occupation VARCHAR(160) NULL AFTER age,
    MODIFY COLUMN skill VARCHAR(500) NOT NULL,
    ADD COLUMN areas_of_interest VARCHAR(1000) NULL AFTER skill,
    ADD COLUMN availability VARCHAR(200) NULL AFTER areas_of_interest,
    ADD COLUMN preference VARCHAR(16) NULL AFTER availability,
    ADD COLUMN motivation VARCHAR(2000) NULL AFTER preference;
