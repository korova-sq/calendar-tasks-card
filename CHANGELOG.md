# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-XX-XX

### Added

- **Multi-day events**: events spanning several days now appear on every day
  they cover, instead of only on their start date. Each day shows a counter
  next to the title, e.g. `Holiday (2/6)`, like Google Calendar and Apple
  Calendar.
- `multi_day_events` option (default: `true`) to turn this off and go back to
  showing multi-day events on their start date only.
- **German translation** (`de`), contributed by @CptPICHU. The card and the
  visual editor are now available in Italian, English and German.

### Fixed

- **All-day events in timezones behind UTC**: all-day events no longer render
  one day early in timezones west of UTC (e.g. the Americas). Date-only values
  like `2026-07-21` were parsed as UTC midnight, which fell on the previous day
  in local time. Diagnosed and fixed by @kielsucks.

### Notes

- On continuation days of a multi-day event, the card shows "All day" instead
  of the start time, and the relative time label is hidden.
- The multi-day and timezone fixes affect all calendar integrations (Google,
  CalDAV, iCloud, Local Calendar) — neither was specific to one provider.
- Language still follows your Home Assistant setting, with English as fallback
  for unsupported languages.

### Credits

- Multi-day events suggested by NavNav on the Home Assistant community forum.
- Timezone fix diagnosed and fixed by @kielsucks (issue #3, PR #2).
- German translation by @CptPICHU (issue #4).
- Thanks to all three for helping the card grow!

[1.6.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.6.0

## [1.5.0] - 2026-XX-XX

### Added

- **Fully localized visual editor**: all section titles, toggle labels, and field
  names in the editor are now translated based on your Home Assistant language
  setting.
- Translations available in Italian and English.
- Localized elements: section titles (Entities, General, Localization, Display,
  Weather, Tasks, Filters, Interactions), all toggles (Show title, Compact mode,
  Show weather, etc.), field labels (Days to show, Weather entity, Overdue days,
  etc.), action editor (Tap, Hold, Double tap), and color picker tooltips.

### Fixed

- **Language fallback logic**: if Home Assistant is set to an unsupported
  language (French, German, Spanish, etc.), the card now correctly falls back
  to English. Previously, it could incorrectly pick up the browser's language.

### Notes

- No changes to functionality — this is a UI improvement.
- Existing configurations continue to work as before.
- The card display language was already localized in previous versions; this
  release completes the localization to the editor UI.

[1.5.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.5.0

## [1.4.0] - 2026-XX-XX

### Added

- **Exclude filter**: a new `exclude` configuration option lets you hide
  events and tasks whose titles contain specific keywords.
- **Editor UI**: a new "Filters" section in the visual editor with chip-style
  keyword management (add/remove keywords visually).
- Match is partial (sub-string) and case-insensitive, so `exclude: ["meeting"]`
  hides "Weekly meeting", "Meeting room", "meeting notes", etc.
- Applies to both calendar events and todo tasks.

### Configuration

- `exclude: []` — list of keywords to filter (default: empty, no filtering)
- Example: `exclude: ["Birthday", "Meeting"]` hides any event or task with
  "Birthday" or "Meeting" in the title.

### Notes

- Filter defaults to empty, so existing setups behave exactly as before.
- Match is case-insensitive: `["meeting"]` is the same as `["Meeting"]`.
- Empty keywords are ignored to prevent accidentally hiding everything.

### Credits

- Feature requested and prototyped by [@lelouch9999](https://github.com/lelouch9999)
  in issue [#1](https://github.com/korova-sq/calendar-tasks-card/issues/1).
  Thanks for the great suggestion and the working prototype!

[1.4.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.4.0

## [1.3.0] - 2026-XX-XX

### Added

- **Weather support**: a new weather section in the editor lets you display
  weather information from any HA `weather.*` entity.
- **Today's weather widget**: shows current condition, temperature, min/max
  and humidity at the top of the card.
- **Weather per day**: shows weather icon and temperature next to each day's
  date in the agenda (uses HA forecast attribute, typically 5-7 days ahead).
- Both options can be enabled independently — show only today's widget,
  only per-day weather, or both.
- Localized condition labels (Italian and English).

### Configuration

- `show_weather: true/false` — master toggle to enable weather (default: false)
- `weather_entity: weather.home` — HA weather entity to use
- `show_weather_today: true/false` — show top widget for today (default: true)
- `show_weather_per_day: true/false` — show icon+temp per day (default: false)

### Notes

- Weather defaults to OFF, so the card behaves exactly as before unless you
  enable it.
- For days beyond the forecast range (typically 5-7 days), no weather is
  shown (no placeholder, no error).
- Weather updates automatically when the underlying weather entity changes
  state (no manual refresh needed).

[1.3.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.3.0

## [1.2.0] - 2026-XX-XX

### Added

- **Limit visible events**: a new toggle option that, when enabled, limits the
  number of visible events and adds a smooth internal scrollbar for the rest.
  Combined with `max_events_visible` to set the limit (default 3).
- **Compact mode**: a new `compact_mode` toggle reduces vertical spacing for a tighter
  card layout. Useful for dashboards where space is limited.
- Custom thin scrollbar styling for both WebKit (Safari/Chrome) and Firefox.

### Configuration

- `limit_events_visible: true/false` — enable/disable the visible events limit (default: false)
- `max_events_visible: N` — number of events to show when the limit is enabled (default: 3)
- `compact_mode: true/false` — reduced spacing (default: false)

### Notes

- All new options default to OFF/disabled, so the card behaves exactly as before
  unless you enable them.
- The header (title + buttons) stays fixed when scrolling internally.
- The collapsed state still hides the body completely; the new options don't affect it.

[1.2.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.2.0

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
