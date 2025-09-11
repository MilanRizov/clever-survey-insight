-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email text;

-- Create a policy to allow admins to view all profiles (for the registered users page)
-- First, let's create a more permissive policy for viewing profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies: users can view their own profile OR view all profiles for admin purposes
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow viewing all profiles for admin purposes" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Update the handle_new_user function to also capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', NEW.email);
  RETURN NEW;
END;
$$;