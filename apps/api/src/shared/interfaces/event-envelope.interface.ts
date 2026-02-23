export interface EventMetadata {
  version: string;
  schema: string;
  correlationId: string;
  userId?: string;
  /**
   * @deprecated Single-realm: not used for routing or tenant resolution. Consumers use configured realm (RealmContextService). Kept for backward compatibility with existing messages.
   */
  realm?: string;
}

export interface EventEnvelope<TData = Record<string, unknown>> {
  eventType: string;
  eventId: string;
  timestamp: string;
  source: string;
  data: TData;
  metadata: EventMetadata;
}
