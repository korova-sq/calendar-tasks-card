# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-XX-XX

### Added

- **Location display for calendar events**: events with a `LOCATION` field (from
  CalDAV, Google Calendar, etc.) can now show the location below the title,
  with a pin icon. Toggle `show_location` in the Display section.
- **Clickable location**: when enabled, the location becomes a link that opens
  Google Maps in a new tab with the location as the search query. Works on
  desktop and mobile. Toggle `location_clickable` in the Display section.
- Multi-line locations (common with CalDAV iCloud, e.g. "Rho\nMI, Italia") are
  normalized to a single comma-separated line for clean display.
- New localization strings for "Open in Maps" tooltip (English and Italian).

### Notes

- Both new toggles are OFF by default to avoid surprising existing users.
- Only calendar events show location; todo tasks don't expose location
  via Home Assistant's `todo.get_items` API.

[1.1.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.1.0

## [1.0.0] - 2026-XX-XX

First public release.

### Features

- Unified agenda view combining calendar events and todo tasks
- Smart sections: Days, No Date, Overdue, Completed
- Task completion via checkbox (supported integrations)
- Color coding with 12-color palette per entity, auto-assigned when unset
- Multilingual support (English, Italian) with auto-detection
- Time format options: auto / 24h / 12h
- First day of week configurable
- ISO 8601 week numbers as visual separators
- Relative time labels (Tomorrow, In 3 days, Yesterday, etc.)
- Collapsible card with persistent state in localStorage
- Refresh button with force-update of all integrations
- Tap, hold, and double-tap actions (Home Assistant standard)
- Visual editor with sections, icons, and color pickers
- Lightweight YAML output (only non-default options saved)
- Safe handling of empty entity slots in YAML (auto-cleaned)

### Known limitations

- iCloud CalDAV: completing tasks fails due to a Home Assistant core bug
- Google Tasks: time-of-day is not preserved (API limitation)
- Calendar events cannot be marked "completed" (only todo tasks)

[1.0.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.0.0
