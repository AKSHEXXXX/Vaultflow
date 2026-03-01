-- Add created_at and updated_at columns to refresh_tokens table
-- Required because RefreshToken entity extends BaseEntity

ALTER TABLE refresh_tokens
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
