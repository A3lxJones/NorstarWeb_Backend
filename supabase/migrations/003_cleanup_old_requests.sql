-- ============================================================
-- Automatic Cleanup of Old Availability Requests
-- Deletes requests (and cascaded responses) where the event
-- date is more than 14 days in the past.
-- Runs daily via pg_cron.
-- ============================================================

-- ─── Cleanup Function ───────────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_old_availability_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM availability_requests
  WHERE event_date < CURRENT_DATE - INTERVAL '14 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ─── Schedule daily cleanup at 3:00 AM UTC via pg_cron ──────
-- Only schedule if the cron extension is available.
-- The cleanup function can still be called manually via SQL if needed.
DO $$
BEGIN
  -- Try to schedule the cleanup job
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-old-availability-requests',
      '0 3 * * *',
      'SELECT cleanup_old_availability_requests()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- If the extension doesn't exist or scheduling fails, just continue
  -- The function is still available for manual calls
  NULL;
END $$;
