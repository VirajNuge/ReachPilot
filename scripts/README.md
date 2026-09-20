# Maintenance scripts

These scripts are local operational tools. They are not part of the web request path and should be run only against an intentionally selected database.

## Safety rules

- Load credentials from `.env.local` or the process environment; never commit real values.
- Use a development or backup database before running migrations or cleanup operations.
- Review the script source and database target before running a destructive command.
- `cleanup_x_data.ts` requires an explicit confirmation value and will not run without it.

## Available scripts

### Change a user password

```bash
node scripts/change-user-password.js --username "<username>" --password "<new-password>"
```

Requires `MONGO_URI` or `MONGODB_URI`. The script loads `.env.local` and updates the matching user with a bcrypt password hash.

### Seed or update a user

```bash
node scripts/seed-user.js --username "<username>" --email "<email>" --first-name "<first-name>" --last-name "<last-name>" --password "<password>"
```

The identity and password values are required as arguments or through `SEED_USERNAME`, `SEED_EMAIL`, `SEED_FIRST_NAME`, `SEED_LAST_NAME`, and `SEED_PASSWORD`. No default account or password is embedded in the script.

### Migrate analysis sessions

```bash
npx tsx scripts/migrate-analysis-sessions-to-history.ts
```

Requires `MONGO_URI` or `MONGODB_URI`. Review the migration plan and use a database backup before running it against production data.

### Seed caption templates

```bash
npx tsx scripts/seedCaptionTemplates.ts
```

Requires `MONGO_URI`. The script skips seeding when the target collection already contains templates.

### Clean X data

This operation permanently deletes X posts and metrics from MongoDB. It is disabled unless explicitly confirmed:

```powershell
$env:ALLOW_DESTRUCTIVE_SCRIPTS = "cleanup-x-data"
npx tsx cleanup_x_data.ts
```

On macOS or Linux:

```bash
ALLOW_DESTRUCTIVE_SCRIPTS=cleanup-x-data npx tsx cleanup_x_data.ts
```

### Inspect LinkedIn connections

```bash
node scripts/inspect_linkedin_connection.js
```

This is a local diagnostic tool. Access and refresh tokens are intentionally redacted in its output. Do not run it in a shared terminal or paste its output into issue trackers.

## Email setup notes

SendGrid configuration notes are in `scripts/setup-sendgrid.md`. The web application uses `SENDGRID_API_KEY` and `EMAIL_FROM` when configured.
