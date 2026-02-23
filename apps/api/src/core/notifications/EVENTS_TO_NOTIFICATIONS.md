# Event → notification channel mapping

Events consumed by `NotificationEventsHandler` trigger the following notifications:

| Event type                                                | Channels      | Description                                                                                    |
| --------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `hr.employee.hired`, `system.hr.employee.hired`           | email, in_app | Welcome notification to new hire (recipient: employee email).                                  |
| `audit.finding.critical`, `system.audit.finding.critical` | email, in_app | Security alert via `NotifySecurityEventUseCase` (recipients: from event or secops@blih.local). |

Event envelope must include `metadata.version` and `metadata.schema` per EVENT_CONTRACTS. Body/title can be driven by event payload (e.g. `event.data.title`, `event.data.description`).
