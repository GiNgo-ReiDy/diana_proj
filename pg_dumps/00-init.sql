DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'uniuser') THEN
        CREATE ROLE uniuser WITH LOGIN PASSWORD '1234';
    END IF;
END $$;

CREATE DATABASE universities OWNER uniuser;
GRANT ALL PRIVILEGES ON DATABASE universities TO uniuser;
