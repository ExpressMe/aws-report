DO $$
BEGIN
    -- Check if we're running locally (can be customized based on your environment)
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'rds_iam'
    ) THEN
        -- Create the rds_iam role for local development
        CREATE ROLE rds_iam;
    END IF;
END
$$;

CREATE USER lambda_user WITH LOGIN; 
GRANT rds_iam TO lambda_user;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO lambda_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lambda_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lambda_user;

-- Make sure future tables are accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lambda_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT USAGE, SELECT ON SEQUENCES TO lambda_user;