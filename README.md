# Communication Core Platform

This is a multi-tenant communication platform for WhatsApp messaging integration.

## Setup

1. Install dependencies: `npm install`

2. Set up environment variables in `.env`:
   - SUPABASE_URL=your_supabase_project_url
   - SUPABASE_ANON_KEY=your_supabase_anon_key
   - REDIS_URL=redis://localhost:6379
   - PORT=3000
   - WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_meta_webhook_verify_token
   - WHATSAPP_APP_SECRET=your_meta_app_secret (optional, enables signature verification)

3. Create Supabase tables:
   - projects: id (uuid), project_id (text), api_key (text), waba_number (text), callback_url (text), created_at (timestamp)
   - messages: id (uuid), project_id (text), channel (text), to_number (text), message (text), status (text), created_at (timestamp)

4. Start Redis server.

5. Build: `npm run build`

6. Start server: `npm start`

7. Start worker: `npm run worker`

## API

POST /send-notification

Headers: Authorization: <apiKey>

Body: { "channel": "whatsapp", "to": "91XXXXXXXXXX", "message": "Hello" }

## Project Onboarding API

POST /api/v1/projects

Body:
{
  "projectName": "string",
  "callbackUrl": "string",
  "wabaNumber": "string",
  "phoneNumberId": "string",
  "accessToken": "string"
}

Response:
{
  "projectId": "...",
  "apiKey": "..."
}

GET /api/v1/projects/:id

Headers: Authorization: <apiKey>

PUT /api/v1/projects/:id

Headers: Authorization: <apiKey>

Body (any of):
{
  "projectName": "string",
  "callbackUrl": "string",
  "wabaNumber": "string",
  "phoneNumberId": "string",
  "accessToken": "string"
}

## Webhook (Meta WhatsApp)

Configure Meta callback URL: `https://your-domain/webhook/whatsapp`

For testing, this alias also works: `https://your-domain/api/whatsapp/webhook`

GET /webhook/whatsapp

Meta verification handshake. Uses `WHATSAPP_WEBHOOK_VERIFY_TOKEN` to validate `hub.verify_token` and returns `hub.challenge`.

POST /webhook/whatsapp

Receives Meta `whatsapp_business_account` payloads, resolves the tenant by `metadata.phone_number_id` (fallback: `metadata.display_phone_number` matched to `waba_number`), and forwards the original payload to that project's `callback_url`.

If `WHATSAPP_APP_SECRET` is set, requests must include a valid `X-Hub-Signature-256` header.

## Sample Curl

curl -X POST http://localhost:3000/send-notification \
  -H "Authorization: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp", "to": "91XXXXXXXXXX", "message": "Hello World"}'