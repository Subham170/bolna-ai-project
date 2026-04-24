# Hire Flow Server

Backend API for AI HR Interview Caller using Express, MongoDB, and Gemini.

## Setup

1. Copy `.env.example` to `.env`
2. Add your MongoDB URI and Gemini API key
3. Install dependencies:
   - `npm install`
4. Run development server:
   - `npm run dev`

## API Endpoints

- `GET /api/health`
- `POST /api/jobs`
- `GET /api/jobs`
- `POST /api/candidates`
- `GET /api/candidates?jobId=<id>&status=<status>`
- `POST /api/calls/initiate`
- `POST /api/calls/webhook/bolna`
- `POST /api/calls/sync/:executionId`
- `POST /api/calls/transcript`
- `GET /api/calls/candidate/:candidateId`

## Transcript Scoring Payload

`POST /api/calls/transcript`

```json
{
  "candidateId": "candidate_mongo_id",
  "transcript": "full transcript text from call"
}
```

## Bolna Call Initiation Payload

`POST /api/calls/initiate`

```json
{
  "candidateId": "candidate_mongo_id",
  "scheduled_at": "2026-04-24T10:30:00.000Z",
  "user_data": {
    "custom_note": "screen for backend role"
  }
}
```
