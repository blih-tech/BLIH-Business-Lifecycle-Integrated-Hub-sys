const DEFAULT_TIMESTAMP = '2026-02-20T12:00:00.000Z';
const DEFAULT_REQUEST_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const API_VERSION = 'v1';

export interface EnvelopeErrorExampleOptions {
  message: string;
  code: string;
  details?: string;
  fieldErrors?: { field: string; message: string }[];
}

/** Build error response example in envelope format (success, message, data, error, meta). */
export function createEnvelopeErrorExample(
  options: EnvelopeErrorExampleOptions,
) {
  return {
    success: false,
    message: options.message,
    data: null,
    error: {
      code: options.code,
      ...(options.details !== undefined && { details: options.details }),
      ...(options.fieldErrors !== undefined &&
        options.fieldErrors.length > 0 && { fieldErrors: options.fieldErrors }),
    },
    meta: {
      timestamp: DEFAULT_TIMESTAMP,
      requestId: DEFAULT_REQUEST_ID,
      version: API_VERSION,
    },
  };
}
