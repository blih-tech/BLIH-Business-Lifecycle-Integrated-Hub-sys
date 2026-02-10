# AI Chatbot Integration Specification

**Module:** Brain (AI)  
**Component:** Chatbot Client & Channel Integrations  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Client-Side Integration (SDK)](#1-client-side-integration-sdk)
2. [WebSocket Protocol Spec](#2-websocket-protocol-spec)
3. [Channel Integrations (Slack/Teams)](#3-channel-integrations-slackteams)
4. [Voice Interface Integration](#4-voice-interface-integration)
5. [Webhook Events](#5-webhook-events)

---

## 1. Client-Side Integration (SDK)

To embed the BLIH Chatbot into frontend applications (React, Vue, or Vanilla JS).

### 1.1 Embedded Widget (Script Tag)

For legacy apps or external portals.

```html
<script 
  src="https://blih.com/sdk/chat-widget.js" 
  data-company-id="uuid" 
  data-color="#4F46E5">
</script>

<script>
  window.BLIH.init({
    context: {
      user_id: "u_123",
      role: "admin",
      current_page: "/finance/invoices"
    }
  });
</script>
```

### 1.2 React Component

For the main BLIH Dashboard.

```typescript
import { ChatProvider, ChatWidget } from '@blih/ui/chat';

export default function App() {
  return (
    <ChatProvider 
      config={{ 
        apiUrl: 'https://api.blih.com/v1/brain',
        wsUrl: 'wss://api.blih.com/ws/chat' 
      }}
    >
      <Layout>
        {/* Your App Content */}
        <ChatWidget 
          initialMessage="How can I help with Finance today?"
          floating={true}
        />
      </Layout>
    </ChatProvider>
  );
}
```

---

## 2. WebSocket Protocol Spec

Real-time communication for streaming responses.

**Endpoint:** `wss://api.blih.com/ws/chat/v1`

### 2.1 Message Packets

**Client -> Server (User Message):**
```json
{
  "type": "USER_MESSAGE",
  "payload": {
    "session_id": "sess_abc123",
    "content": "Analyze the Q1 report",
    "attachments": [
      { "id": "doc_xyz", "type": "pdf" }
    ]
  }
}
```

**Server -> Client (Token Stream):**
```json
{
  "type": "STREAM_TOKEN",
  "payload": {
    "chunk": "The",
    "index": 0
  }
}
```

**Server -> Client (Reference):**
```json
{
  "type": "CITATION",
  "payload": {
    "id": 1,
    "doc_id": "doc_xyz",
    "snippet": "Revenue grew by 15%...",
    "page": 42
  }
}
```

---

## 3. Channel Integrations (Slack/Teams)

Allow users to chat with BLIH directly from their collaboration tools.

### 3.1 Slack App Integration

**Manifest `slack-manifest.yaml`:**
```yaml
display_information:
  name: BLIH Bot
features:
  bot_user:
    display_name: BLIH
    always_online: true
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - chat:write
      - files:read
settings:
  event_subscriptions:
    request_url: https://api.blih.com/integrations/slack/events
    bot_events:
      - app_mention
```

**Handling Events:**
1. **Event:** `app_mention` received.
2. **Action:** BLIH extracts text + thread ID.
3. **Processing:** Sends to RAG Pipeline.
4. **Response:** Posts back to Slack thread using `chat.postMessage`.

### 3.2 Microsoft Teams Bot

**Architecture:**
- Uses **Azure Bot Framework Adapter**.
- Endpoint: `POST /api/integrations/teams/messages`.

---

## 4. Voice Interface Integration

Integrate with Speech-to-Text (STT) and Text-to-Speech (TTS) for accessibility and mobile apps.

### 4.1 Audio Input Stream

**Protocol:** Binary WebSocket Stream

```javascript
// Client
const ws = new WebSocket('wss://api.blih.com/ws/voice');
ws.send(audioBlob); // PCM 16-bit, 16kHz
```

**Server Implementation:**
1. **Receive:** Stream chunks to OpenAI Whisper API (or local Whisper).
2. **Transcribe:** Real-time transcription.
3. **Process:** Send transcript to RAG Chatbot.
4. **Synthesize:** Generate MP3 from response (ElevenLabs / Coqui).
5. **Respond:** Stream audio back to client.

---

## 5. Webhook Events

External systems can subscribe to Chatbot events.

**Events:**
- `chat.session.started`: New conversation initiated.
- `chat.message.created`: New message (user or bot).
- `chat.feedback.received`: User rated a response.
- `chat.handoff.requested`: User asked for human agent.

**Payload Example (`chat.handoff.requested`):**
```json
{
  "event": "chat.handoff.requested",
  "timestamp": "2026-02-10T14:30:00Z",
  "data": {
    "session_id": "sess_123",
    "user_id": "u_456",
    "reason": "negative_feedback_loop",
    "summary": "User is asking about complex tax compliance issues.",
    "transcript_url": "https://blih.com/admin/chats/sess_123"
  }
}
```
