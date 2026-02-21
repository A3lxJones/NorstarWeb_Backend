-- Make gender and emergency_contact_relationship optional fields
-- These are no longer required for child registration

ALTER TABLE children ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE children ALTER COLUMN emergency_contact_relationship DROP NOT NULL;
