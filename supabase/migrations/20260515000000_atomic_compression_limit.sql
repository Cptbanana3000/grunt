-- Atomically claim a compression slot for a user.
-- Resets the daily counter if the date has rolled over, then increments if under the limit.
-- Returns { allowed: boolean, used_today: int }.
CREATE OR REPLACE FUNCTION claim_compression_slot(p_user_id uuid, p_daily_limit int)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_new_count int;
BEGIN
  UPDATE profiles
  SET
    daily_compressions = CASE
      WHEN last_compression_date < v_today THEN 1
      ELSE daily_compressions + 1
    END,
    last_compression_date = v_today
  WHERE id = p_user_id
    AND (last_compression_date < v_today OR daily_compressions < p_daily_limit)
  RETURNING daily_compressions INTO v_new_count;

  IF FOUND THEN
    RETURN jsonb_build_object('allowed', true, 'used_today', v_new_count);
  ELSE
    RETURN jsonb_build_object(
      'allowed', false,
      'used_today', (SELECT daily_compressions FROM profiles WHERE id = p_user_id)
    );
  END IF;
END;
$$;
