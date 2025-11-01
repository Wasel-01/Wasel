@echo off
REM Apply Supabase migrations (Windows helper)
REM Requires Supabase CLI installed or will use npx supabase if available.
SETLOCAL
IF NOT DEFINED SUPABASE_URL (
  echo SUPABASE_URL is not set. Please set SUPABASE_URL environment variable or add it to a .env file.
  exit /b 1
)

nIF NOT DEFINED SUPABASE_ANON_KEY (
  echo SUPABASE_ANON_KEY is not set. Please set SUPABASE_ANON_KEY environment variable or add it to a .env file.
  exit /b 1
)

necho Applying Supabase migrations using `npx supabase db push`...
npx supabase db push
IF %ERRORLEVEL% NEQ 0 (
  echo Failed to apply migrations.
  exit /b %ERRORLEVEL%
)
echo Migrations applied successfully.
ENDLOCAL
exit /b 0