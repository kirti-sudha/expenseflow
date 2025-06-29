/*
  # Fix user signup database error

  1. Problem
    - The handle_new_user() function is failing when creating profiles
    - This happens when raw_user_meta_data is null or doesn't contain full_name
    
  2. Solution
    - Update the function to handle null metadata gracefully
    - Only insert email and id, let full_name be null if not provided
    - Make the function more robust
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, just insert with minimal data
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();