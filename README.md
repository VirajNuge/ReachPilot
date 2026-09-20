# ReachPilot

ReachPilot is an AI-assisted social content and relationship workspace for creators, consultants, founders, and agencies. It combines profile intelligence, content ideation, post analysis, publishing workflows, analytics, and client management in one application.

## What ReachPilot includes

- Profile analysis and audience intelligence
- AI-assisted ideas, hooks, captions, replies, and post generation
- Post analysis with history and comparison workflows
- Content inspiration and saved ideas
- Analytics, KPIs, recommendations, and publishing views
- Client manager and client workspace tools
- Connected social-platform workflows
- Browser-extension session authentication
- Invite-only account creation using one server-managed access code
- Admin area for users, templates, visual styles, and writing styles

The public guest experience is available at `/` and includes `/services`, `/pricing`, `/inspirations`, `/contact`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/terms`, `/privacy`, and `/cookies`.

## Tech stack

- Next.js 15.5.25 with the App Router
- React 19 and TypeScript
- MongoDB
- Framer Motion, Tailwind CSS, and CSS modules
- Vitest and Testing Library
- ESLint
- JWT-based authentication with HTTP-only cookies
- OpenRouter-compatible AI configuration

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB database
- An OpenRouter API key for AI features

## Getting started

```bash
git clone https://github.com/VirajNuge/ReachPilot.git
cd ReachPilot
npm install
Copy-Item .env.local.example .env.local
```

On macOS or Linux, use `cp .env.local.example .env.local` instead of the PowerShell command.

Fill in the required values in `.env.local`, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

The complete variable list and comments are in [.env.local.example](.env.local.example). The most important values are:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. `MONGODB_URI` is also supported by the server connection helper. |
| `JWT_SECRET` | Secret used to sign user authentication tokens. |
| `SIGNUP_ACCESS_CODE` | Reusable owner-provided code required for every new account. |
| `OPENROUTER_API_KEY` | Server-side key for AI features. |
| `ADMIN_JWT_SECRET` | Secret used by the admin authentication flow. |
| `ADMIN_USERNAME` | Admin login username. |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash for the admin password. |
| `EXTENSION_TOKEN_SECRET` | Secret used to issue short-lived browser-extension tokens. |
| `EXTENSION_ALLOWED_ORIGINS` | Comma-separated list of permitted extension origins. |
| `EXPO_PUBLIC_API_BASE_URL` | API base URL used by the mobile client. |

Never commit `.env.local`, API keys, JWT secrets, admin credentials, or the signup code. `SIGNUP_ACCESS_CODE` must remain server-only and must never be renamed to a `NEXT_PUBLIC_*` variable. In production, signup fails closed when the code is not configured.

## Invite-only signup

ReachPilot does not allow open account creation. A visitor must provide the owner-managed access code on `/signup`. The code is validated in `POST /api/auth/signup` before the user is created or an authentication cookie is issued.

The code is reusable for multiple invited users and can be rotated by changing the deployment environment variable and redeploying. It is case-sensitive, trimmed for accidental surrounding whitespace, compared using a constant-time digest comparison, and never returned to the browser.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server on port 3000. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build locally. |
| `npm run typecheck` | Run TypeScript validation without emitting files. |
| `npm run lint` | Run ESLint across the repository. |
| `npm test` | Run the Vitest test suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:coverage` | Run tests with coverage reporting. |
| `npm run build:analyze` | Build with bundle analysis enabled. |

Before opening a pull request, run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Project layout

```text
app/
  page.tsx                    Public homepage
  components/                 Shared guest, auth, legal, and UI components
  [id]/                       Current authenticated workspace routes
  api/                        Next.js route handlers
  admin/                      Admin screens
  pages/                      Compatibility routes and app components
components/                   Reusable application components
hooks/                        Shared React hooks
lib/                          Auth, database, AI, models, and server utilities
public/                       Static images and other public assets
docs/                         Focused implementation and integration notes
test/ and __tests__/          Automated tests
```

## Browser-extension authentication

The extension first exchanges a normal ReachPilot session token for a short-lived extension token:

```http
POST /api/extension/session
Authorization: Bearer <reachpilot-session-token>
Content-Type: application/json

{"accountId":"<owned-account-id>"}
```

Send the returned token to extension endpoints with an allowlisted `Origin`. Production requests require both the signed token and an allowed origin. See [docs/extension-auth.md](docs/extension-auth.md) for the full contract.

## Deployment

ReachPilot can be deployed to Vercel using the repository’s `build` script:

```bash
npm run build
```

Configure the production environment variables in the hosting provider before deploying. In particular, set `MONGO_URI`, `JWT_SECRET`, `SIGNUP_ACCESS_CODE`, the AI provider settings, and the extension/admin secrets when those features are enabled.

The application uses runtime database validation so a missing MongoDB variable does not prevent the Next.js build from being collected. Database-backed routes still require a valid MongoDB connection at runtime.

## Legal and product notes

The `/terms`, `/privacy`, and `/cookies` pages are draft policy pages. They intentionally contain placeholders for the legal business name, address, support email, jurisdiction, retention periods, analytics providers, payment provider, consent behavior, and effective dates. Review them with qualified legal counsel before treating them as final policies.

AI output is assistive and should be reviewed before publishing, sending, or using it for business decisions. Connected social platforms remain subject to their own terms, limits, and API availability.

## License

See [LICENSE](LICENSE) for the project license.
