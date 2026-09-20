# ReachPilot extension API authentication

The browser extension must obtain a short-lived session token from:

```text
POST /api/extension/session
Authorization: Bearer <normal ReachPilot session token>
Content-Type: application/json

{"accountId":"<owned-account-id>"}
```

The response contains an `extensionToken` valid for 15 minutes. Send it to
extension endpoints as:

```text
Authorization: Bearer <extensionToken>
Origin: <one of EXTENSION_ALLOWED_ORIGINS>
```

Production requests require both the signed token and an allowlisted origin.
The legacy unauthenticated extension mode is available only when
`NODE_ENV` is not `production` and `ALLOW_LEGACY_EXTENSION_AUTH=true`.

Set `EXTENSION_TOKEN_SECRET` to a random secret of at least 32 characters and
configure comma-separated extension origins in `EXTENSION_ALLOWED_ORIGINS`.
