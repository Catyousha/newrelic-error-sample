# New Relic `recordError` Flow (Aligned with ayo-apk-retailer)

This sample follows the same `recordError` flow used in `ayo-apk-retailer`.

## Scope

Only API errors with HTTP status `>= 500` are reported through `recordError`.

## Entry Point

- API wrapper: `src/helpers/api.ts`
- Error helper: `src/helpers/NewRelicHelper.ts`

## Runtime Flow

1. API request fails in `request(...)` catch block in `src/helpers/api.ts`.
2. `reportInternalServerError(error, { method, url })` is called before the error is re-thrown.
3. In `src/helpers/NewRelicHelper.ts`, reporting stops early if one of these is true:
- `globalThis.newrelic` is not available.
- HTTP status is not finite.
- HTTP status is less than `500`.
4. Helper builds normalized attributes:
- `httpStatus`
- `requestUrl`
- `requestMethod`
- `errorMessage` (truncated)
- `serverPayload` (truncated)
5. Helper ensures an `Error` object exists (`error instanceof Error ? error : new Error(...)`).
6. Helper sends the event with `newRelic.recordError(errorObject, attributes)`.
7. Reporting failures are swallowed to avoid breaking app flow (warn in dev only).

## Alignment Notes

This flow intentionally mirrors `ayo-apk-retailer`:
- Same `>= 500` reporting threshold.
- Same guard-first safety pattern.
- Same attribute shape.
- Same non-blocking behavior when reporting fails.

## Related Files

- `src/helpers/api.ts`
- `src/helpers/NewRelicHelper.ts`
