-- V3__rename_submitted_to_pending.sql
-- Rename document status 'SUBMITTED' to 'PENDING' to match frontend expectations

UPDATE documents SET status = 'PENDING' WHERE status = 'SUBMITTED';
