# Communication Core Platform

This is a multi-tenant communication platform for WhatsApp messaging integration.

## Setup

1. Install dependencies: `npm install`

2. Set up environment variables in `.env`:
   - SUPABASE_URL=your_supabase_project_url
   - SUPABASE_ANON_KEY=your_supabase_anon_key
   - REDIS_URL=redis://localhost:6379
   - PORT=3000

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

## Webhook

POST /webhook/whatsapp

Forwards to the project's callback_url based on waba_number.

## Sample Curl

curl -X POST http://localhost:3000/send-notification \
  -H "Authorization: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp", "to": "91XXXXXXXXXX", "message": "Hello World"}'