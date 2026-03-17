# API → notification channel mapping

API calls consumed by `NotificationController` trigger the following notifications:

| API endpoint/trigger                        | Channels      | Description                                                                                      |
| ------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `POST /api/v1/notifications/employee-hired` | email, in_app | Welcome notification to new hire (recipient: employee email).                                    |
| `POST /api/v1/notifications/security-event` | email, in_app | Security alert via `NotifySecurityEventUseCase` (recipients: from payload or secops@blih.local). |

API payload must include relevant data for generating notifications (e.g., employee email, security event details).
