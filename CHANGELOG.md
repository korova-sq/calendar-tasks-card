# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.1] - 2026-08-25

### Fixed
- Overlapping `_fetchAll()` runs caused 6–10 duplicate, byte-identical calendar requests per refresh cycle. `_lastFetch` is now claimed at the start of the fetch (before any await) so state changes arriving mid-fetch no longer spawn parallel fetches. Thanks @christophergoltz for the detailed report and fix (#12).

[1.9.1]: https://github.com/korova-sq/calendar-tasks-card/compare/v1.9.0...v1.9.1


## [1.9.0] - 2026-08-24

### Added

- **View switch button**: a new header button (toggle: `show_view_switch`)
  lets you switch between the agenda list and the monthly grid without opening
  the editor. The icon reflects the view you'll switch to. The editor's
  `month_view` toggle sets the default; the button changes the view for the
  current session only and reverts to the default on reload (same behaviour as
  other calendar cards). Requested by [@JourMic](https://github.com/JourMic)
  (issue [#9](https://github.com/korova-sq/calendar-tasks-card/issues/9)).
- **Current date in header**: a new `show_current_date` option shows today's
  date as a subtitle under the card title, localised to the card language
  (e.g. "Domenica 23 agosto 2026"). Works even when the title is hidden.
  Requested by MasterTim17
  (issue [#11](https://github.com/korova-sq/calendar-tasks-card/issues/11)).
- **Hide "No Date" section**: a new `show_no_date` option (default `true`) in
  the Tasks section lets you hide the "No Date" section, matching the existing
  `show_overdue` / `show_completed` toggles. Useful when an external todo
  source syncs a large backlog of undated tasks. Requested by
  registrierungstrash-svg
  (issue [#10](https://github.com/korova-sq/calendar-tasks-card/issues/10)).
- **card-mod support**: the card now works with
  [card-mod](https://github.com/thomasloven/lovelace-card-mod). A `card_mod:`
  block in the card config is applied to the card and re-applied after every
  render, so custom styles (e.g. `ha-card { … }`) persist through refreshes and
  view changes. Requested by [@JourMic](https://github.com/JourMic)
  (issue [#8](https://github.com/korova-sq/calendar-tasks-card/issues/8)).

### Notes

- All new options default to off, except `show_no_date`, which defaults to on
  to preserve the current behaviour — so existing setups look exactly as before.
- The view switch is a session-only change by design: the editor toggle remains
  the way to set a persistent default, so users who don't enable the button can
  still choose the view.
- card-mod must be installed separately; if it isn't, the `card_mod` block is
  simply ignored.

### Credits

- Thanks to [@JourMic](https://github.com/JourMic), MasterTim17 and
  registrierungstrash-svg for the feature requests that shaped this release.

[1.9.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.9.0

## [1.8.1] - 2026-XX-XX

### Fixed

- **HACS update pickup**: republished as a patch release so HACS reliably picks
  up the French weather-label refinements merged after 1.8.0
  (PR [#7](https://github.com/korova-sq/calendar-tasks-card/pull/7)). No
  functional changes to the card itself.

### Credits

- French weather condition labels refined by
  [@JourMic](https://github.com/JourMic) (PR #7). Merci !

[1.8.1]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.8.1

## [1.8.0] - 2026-XX-XX

### Added

- **Monthly grid view**: a new `month_view` option switches the card from the
  agenda list to a classic month calendar grid, with the days of the month laid
  out in a 7-column grid. Today is highlighted, days from the previous/next
  month are dimmed, and the week starts on your configured first day of the week.
- **Event dots**: days that have at least one event or task show a small dot, so
  you can see at a glance where things are happening across the whole month.
- **Day popup**: tap any day to open a popup listing that day's events and tasks,
  each with its entity colour, time range, all-day flag, location and
  description. Empty days show a "no events" message. An **Add** button opens the
  create form with that day's date pre-filled.
- **Month navigation**: previous/next arrows move between months, and tapping the
  month name opens a picker — a grid of the 12 months with year arrows and a
  **Today** button to jump straight back to the current month.
- **French translation**: the card and the visual editor are now available in
  French, in addition to Italian, English and German.

### Notes

- The month view respects all your existing display toggles: compact mode makes
  the grid denser, "show week number" adds a left column of ISO week numbers,
  and the day popup honours show description / location / end time / clickable
  location / relative time exactly like the agenda.
- The today-weather widget is shown above the grid too; per-day weather stays in
  the agenda view.
- `month_view` defaults to off, so existing setups keep the agenda view and look
  exactly as before.

### Credits

- French translation contributed by [@JourMic](https://github.com/JourMic)
  (issue [#6](https://github.com/korova-sq/calendar-tasks-card/issues/6)). Merci !

[1.8.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.8.0

## [1.7.0] - 2026-XX-XX

### Added

- **Transparent background**: a new `transparent` option removes the card
  background, shadow and border, so the card blends into your dashboard.
- **Background image**: a new `background_image` option accepts a URL or a
  `/local/…` path and paints it as the card background.
- **Overlay control**: a single `background_overlay` slider from `-1` to `+1`
  puts a light or dark veil over the image so the text stays readable on any
  picture. `-1` is a full white veil, `0` is no veil, `+1` is a full black veil.
  Past a dark threshold, the card text automatically switches to a light colour.
- New **Background** section in the visual editor, translated in Italian,
  English and German.
- **Add event/task button**: a new header button (toggle: `show_add_event`)
  opens an inline form to create calendar events and todo tasks without
  leaving the card. Pick the type (event or task), the target calendar or
  list, title, and:
  - for events: all-day toggle, start/end, optional location and description
  - for tasks: optional due date and description
- New **Localization** section labels and full translations for the form in
  Italian, English and German.

### Notes

- Background image and transparency are mutually exclusive: if an image is
  set, it takes precedence and transparency is ignored.
- Transparency is applied both as CSS and as inline `!important` styles,
  including theme variables, so it also works with "glass" themes and card-mod
  which would otherwise re-inject their own background.
- The weather widget band becomes transparent over a background image, so it
  doesn't show as a grey rectangle on top of the picture.
- These background options use the same names as in
  [sun-weather-card](https://github.com/korova-sq/sun-weather-card), so both
  cards are configured the same way.
- The add button uses the official `calendar.create_event` and `todo.add_item`
  services (not Home Assistant's internal event-editor dialog, which isn't
  reliably reachable from an external card). Creating events only works for
  calendars that support it (e.g. Local Calendar, CalDAV) — read-only
  calendars won't accept new events.
- Recurring events aren't supported: the underlying service doesn't offer it.
  Create recurring events from the Calendar tab as usual.
- The form opens as an overlay above the whole dashboard (not confined to the
  card), so it displays fully and scrolls correctly even on short cards or
  small screens.
- All options default to off, so existing setups look exactly as before.

### Credits

- Background options requested by NavNav on the Home Assistant community
  forum. Thanks!
- Add event/task button requested by MasterTim17 (issue #5). Thanks!

[1.7.0]: https://github.com/korova-sq/calendar-tasks-card/releases/tag/v1.7.0

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
