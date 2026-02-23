# BLIH Event Handling

**Purpose:** End-to-end event flow, handler rules, retry/DLQ behavior, and schema validation.  
**Audience:** Backend developers  
**Version:** 1.0 | February 2026

---

## 1. End-to-End Flow

```
Use Case (Producer)
    │
    ├─► EventBusService.publish(eventType, data, metadata)
    │       │
    │       ├─► Build EventEnvelope (Object.freeze)
    │       ├─► persistEvent(envelope) → EventStore + OutboxEvent (status: pending)
    │       ├─► channelWrapper.publish(exchange, eventType, envelope)
    │       │       └─► Publisher confirms (await)
    │       └─► OutboxEvent.update(status: published)
    │
    ▼ (if publish fails)
OutboxPollerService (periodic)
    │
    └─► Poll OutboxEvent where status=pending
        └─► EventBusService.publishFromOutbox(outbox) → retry publish

RabbitMQ (blih.events topic exchange)
    │
    └─► Route to per-module queues (core.events, hr.events, etc.)

Consumer (per queue)
    │
    └─► EventBusService.consumeMessage
            ├─► Parse envelope, validate version/schema
            ├─► markInboundEventProcessed (EventStore unique eventId → idempotency)
            ├─► Dispatch to all handlers for eventType (Promise.allSettled)
            └─► On error: nack + republish with x-retry-count; after max retries → DLQ
```

---

## 2. Handler Idempotency Rules

1. **EventStore deduplication:** Before invoking handlers, the consumer inserts `eventId` into EventStore. Duplicate inserts fail (P2002); the message is acked without processing.
2. **Idempotent handlers:** Handlers must safely tolerate duplicate delivery (e.g. upsert instead of insert, or check existence before create).
3. **Multiple handlers per event:** Several handlers can subscribe to the same event type. All run in parallel; if any fails, the whole message is retried.

---

## 3. Retry and DLQ Behavior

| Step | Action |
|------|--------|
| Handler throws | `channel.nack(message, false, false)` (do not requeue) |
| Retries < max | Republish to same queue with `x-retry-count` incremented, after backoff (`retries * backoffMs`) |
| Retries >= max | Send to `system.dlq`, nack original message |

- Backoff: linear (`nextRetry * RETRY_BACKOFF_MS`, default 1000ms).
- DLQ messages include `x-last-error` header.

---

## 4. Schema Validation

- **Publish:** Envelope uses `metadata.version` and `metadata.schema` (default: `blih.event.{eventType}.v{major}`).
- **Consume:** `isSupportedEnvelope` checks `metadata.version` and `metadata.schema`; rejects if major version mismatch.
- **Optional:** JSON Schema validation for known event types can be added at publish/consume.

---

## 5. Module Handlers

| Handler | Module | Event types |
|---------|--------|-------------|
| CoreSyncEventsHandler | core/events | hr.employee.*, finance.period.closed |
| NotificationEventsHandler | core/notifications | hr.employee.hired, audit.finding.critical |
| SystemEventsConsumerService | platform/messaging | audit.finding.critical, crm.*, projects.*, brain.*, chatbot.* |

---

## 6. References

- [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md) – Envelope schema, catalog, queue topology
- [ARCHITECTURE.md](./ARCHITECTURE.md) – RabbitMQ topology, reliability notes
