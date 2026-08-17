# 🗓 Calendar & Tasks Card

<br>

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/korova-sq/calendar-tasks-card)](https://github.com/korova-sq/calendar-tasks-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-korova.sq-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/korova.sq)

<br>

![Calendar & Tasks Card](screenshots/banner.png)

<br>

## 🤔 What is Calendar & Tasks Card?

Calendar & Tasks Card is a unified agenda view for [Home Assistant](https://www.home-assistant.io/) that combines **calendar events** and **todo tasks** in a single, clean timeline.

Most agenda cards on HACS show either calendar events OR todo tasks. This card unifies them with smart grouping — designed for dashboards where you want to see "what's coming up" at a glance, mixing appointments and reminders without switching cards.

## ✨ Features

- 🛠 **Visual editor** for all options (no YAML editing required)
- 📅 **Unified view**: events and tasks in one timeline, sorted by date
- 🗓️ **Monthly grid view**: switch to a classic month calendar with event dots, tap-a-day popup, and month navigation
- 🎨 **Color picker**: 12-color palette per entity, auto-assigned when unset
- ✅ **Task completion**: tick tasks directly from the card
- 🚨 **Overdue section**: tasks past their deadline highlighted in red
- 📋 **No Date section**: active tasks without a due date
- 🗂 **Completed section**: recently finished tasks for context
- ⏱ **Relative time**: "Tomorrow", "In 3 days", "Yesterday", "1 week overdue"
- 🗓 **Multi-day events**: events spanning several days appear on each one, with a day counter
- 📍 **Event location**: shows the location of calendar events with optional click-to-maps
- 📆 **Week numbers**: ISO 8601 week separators (toggle on/off)
- 🔽 **Collapsible**: hide everything with one click, state persists
- 📋 **Max events visible**: optionally limit visible events with a smooth internal scrollbar
- 📏 **Compact mode**: reduced spacing option for tighter layouts
- ☀️ **Weather support**: optional today's weather widget and per-day forecast
- 🖼 **Custom background**: transparent mode or background image with a light/dark overlay
- ➕ **Add event/task**: inline form to create calendar events and todo tasks without leaving the card
- 🔍 **Exclude filter**: hide events and tasks with specific keywords in their titles
- 🔄 **Force refresh**: button to update all integrations on demand
- 🌐 **Internationalization**: English, Italian, German and French, auto-detects from system (card display + visual editor)
- 🕐 **Time format**: 12h or 24h, follows system preferences
- 👆 **Customizable actions**: tap, hold, double-tap (Home Assistant standard)
- 🪶 **Clean YAML**: only non-default settings are saved
- 🚀 **Zero dependencies**: no other custom cards required

## 📸 Screenshots


<table>
<tr>
<td width="50%"><b>Main view with overdue and completed</b><br><img src="screenshots/01-overview.jpeg" width="100%"></td>
<td width="50%"><b>🎨 Color picker in the editor</b><br><img src="screenshots/02-editor-colors.jpeg" width="100%"></td>
</tr>
<tr>
<td width="50%"><b>⚙️ Editor sections</b><br><img src="screenshots/03-editor-sections.jpeg" width="100%"></td>
<td width="50%"><b>📆 Week numbers</b><br><img src="screenshots/04-week-numbers.jpeg" width="100%"></td>
</tr>
<tr>
<td width="50%"><b>📋 Clean agenda view</b><br><img src="screenshots/05-agenda-view.jpeg" width="100%"></td>
<td width="50%"><b>☀️ Weather support</b><br><img src="screenshots/06-weather-support.jpeg" width="100%"></td>
</tr>
<tr>
<td width="50%"><b>📅 Month picker</b><br><img src="screenshots/06-month-view.jpeg" width="100%"></td>
<td width="50%"><b>📅 Monthly grid view</b><br><img src="screenshots/07-month-picker.jpeg" width="100%"></td>  
</tr>  
<tr>
<td width="50%"><b>📋 Day popup</b><br><img src="screenshots/08-day-popup.jpeg" width="100%"></td>
</tr>  
</table>

Display weather information from any HA `weather.*` entity with two independent options:

- **Today's weather widget** (top of card): shows current condition, temperature, min/max for the day, and humidity.
- **Per-day weather** (next to each date): icon and temperature for the next 5-7 days. For days beyond the forecast range, a discrete cloud-off icon is shown as placeholder.

Both options can be enabled independently — show only one, the other, or both. Enable them in the **Weather** section of the visual editor.

## 📦 Installation

### HACS (recommended)

Calendar & Tasks Card is not yet in the default HACS store. You can add it as a custom repository:

1. Open HACS in Home Assistant
2. Go to **Frontend**
3. Click the three-dot menu (top right) → **Custom repositories**
4. Add: `https://github.com/korova-sq/calendar-tasks-card` (Category: **Lovelace**)
5. Search for **Calendar & Tasks Card** and install
6. Reload your browser (Ctrl+F5 or Cmd+Shift+R)

### Manual installation

1. Download `calendar-tasks-card.js` from the [latest release](https://github.com/korova-sq/calendar-tasks-card/releases)
2. Copy it to `/config/www/calendar-tasks-card.js`
3. Go to **Settings → Dashboards → Resources** (top right ⋮ menu)
4. Click **Add Resource**
5. URL: `/local/calendar-tasks-card.js`, Type: **JavaScript Module**
6. Reload your browser

## ⚙️ Quick start

Once installed, add the card to your dashboard:

1. Edit your dashboard
2. Click **Add Card**
3. Search for **Calendar & Tasks Card**
4. Add your entities and configure via the visual editor

Or via YAML:

```yaml
type: custom:calendar-tasks-card
calendars:
  - calendar.family
todos:
  - todo.shopping
```

That's it. The card will work with sensible defaults.

## 📚 Configuration

The card has a complete visual editor with six sections:

### 📋 Entities
- **Calendars**: any `calendar.*` entity from Home Assistant
- **Todo lists**: any `todo.*` entity (Local To-do, Google Tasks, CalDAV, etc.)

Each entity gets a colored circle where you can pick a color from the 12-color palette. The color applies to the vertical bar next to each event/task in the card.

### 🎛 General
| Option | Default | Description |
|---|---|---|
| `title` | `Agenda` | Card title |
| `show_title` | `true` | Show the title bar |
| `days` | `7` | Days to look ahead |
| `show_refresh` | `true` | Show 🔄 refresh button |
| `show_add_event` | `false` | Show ➕ button in the header to add events/tasks (see below) |
| `show_collapse_button` | `true` | Show ▲ collapse button |
| `limit_events_visible` | `false` | Enable scrollbar to limit visible events |
| `max_events_visible` | `3` | Number of events visible when `limit_events_visible` is true |
| `compact_mode` | `false` | Reduced vertical spacing for tighter layout |
| `show_weather` | `false` | Master toggle to enable weather features |
| `weather_entity` | `""` | HA weather entity to use (e.g. `weather.home`) |
| `show_weather_today` | `true` | Show today's weather widget at the top of the card |
| `show_weather_per_day` | `false` | Show weather icon+temp next to each day's date |
| `exclude` | `[]` | List of keywords; events and tasks with titles containing any keyword will be hidden (partial match, case-insensitive) |

### 🌐 Localization
| Option | Default | Values |
|---|---|---|
| `language` | `auto` | `auto`, `en`, `it`, `de` |
| `time_format` | `auto` | `auto`, `24h`, `12h` |
| `first_day_of_week` | `auto` | `auto`, `monday`, `sunday`, `saturday` |

### 👁 Display
| Option | Default | Description |
|---|---|---|
| `month_view` | `false` | Show a monthly calendar grid instead of the agenda list, with event dots, a tap-a-day popup and month navigation |
| `show_week_number` | `false` | ISO 8601 week separators (agenda) / week-number column (grid) |
| `show_end_time` | `false` | Show `HH:MM–HH:MM` for events |
| `multi_day_events` | `true` | Show multi-day events on every day they span, with a `(2/6)` day counter |
| `show_empty_days` | `false` | Show days with no events |
| `show_relative_time` | `true` | "Tomorrow", "In 3 days" labels |
| `show_source` | `false` | Show entity name as subtitle |
| `show_description` | `true` | Show event/task description |
| `show_location` | `false` | Show event location with map pin icon (calendar events only) |
| `location_clickable` | `false` | Make location clickable, opens Google Maps in new tab |

### 🖼 Background
| Option | Default | Description |
|---|---|---|
| `transparent` | `false` | Remove card background, shadow and border so it blends into the dashboard |
| `background_image` | `null` | Background image, as a URL or a `/local/…` path |
| `background_overlay` | `0` | Veil over the image, from `-1` (full white) through `0` (none) to `+1` (full black), to keep the text readable |

Background image and transparency are mutually exclusive: if an image is set, it takes precedence.

Past a dark overlay threshold, the card text automatically switches to a light colour. Transparency also works with "glass" themes and card-mod.

These options use the same names as in [sun-weather-card](https://github.com/korova-sq/sun-weather-card), so both cards are configured the same way.

### ➕ Add event/task

When `show_add_event` is enabled, a button appears in the header that opens an inline form to create a new calendar event or todo task — without leaving the card or reloading the page.

- Choose **event** or **task** (only shown if you have both calendars and todo lists configured)
- Pick the target calendar or todo list from a dropdown
- **Events**: title, all-day toggle, start/end, optional location and description
- **Tasks**: title, optional due date, optional description

The button only appears if at least one calendar or todo list is configured. The form uses Home Assistant's official `calendar.create_event` and `todo.add_item` services, so creating events only works for calendars that support it (e.g. Local Calendar, CalDAV) — read-only calendars won't accept new events. Recurring events aren't supported, since the underlying service doesn't offer it; create those from the Calendar tab as usual.

### ✅ Tasks
| Option | Default | Description |
|---|---|---|
| `show_overdue` | `true` | Show Overdue section |
| `overdue_days` | `0` | Limit overdue (0 = all) |
| `show_completed` | `true` | Show Completed section |
| `completed_days` | `7` | Limit completed to N days |
| `allow_complete` | `false` | Show checkbox to mark complete |

### 👆 Interactions
Three configurable actions following Home Assistant standards:
- **Tap**: single click
- **Hold**: long press
- **Double tap**: two quick clicks

Each can be: `none`, `more-info`, `toggle`, `navigate`, `url`, `call-service`, or `assist`.

## 📝 Complete YAML example

```yaml
type: custom:calendar-tasks-card
title: Agenda
days: 7
calendars:
  - calendar.family
  - calendar.work
todos:
  - todo.shopping
  - todo.work_tasks
show_week_number: true
show_relative_time: true
show_overdue: true
show_completed: true
completed_days: 7
allow_complete: true
show_location: true
location_clickable: true
language: auto
time_format: 24h
first_day_of_week: monday
entity_colors:
  calendar.family: "#d93025"
  calendar.work: "#4285f4"
  todo.shopping: "#34a853"
tap_action:
  action: navigate
  navigation_path: /lovelace/agenda
```

## 🗂 How tasks are classified

The card automatically sorts tasks into different sections:

| Task state | Where it appears |
|---|---|
| Active, today or future date | In the corresponding day in the agenda |
| Active, no date | 📋 **No Date** section |
| Active, **past date** | 🚨 **Overdue** section (red highlight) |
| Completed (any date) | 🗂 **Completed** section (if enabled) |

## ⚠️ Known limitations

### 🍎 iCloud CalDAV: task completion is broken
Marking a task complete from Home Assistant currently fails for iCloud CalDAV with `Calendar.search() got multiple values for argument 'sort_keys'`. This is a [known bug in Home Assistant core](https://github.com/home-assistant/core/issues), not in this card.

**Workaround**: use Local To-do, Google Tasks, or [Radicale](https://radicale.org/) for tasks you want to complete from HA. iCloud CalDAV still works fine for read-only viewing.

### 📅 Google Tasks: no time-of-day on tasks
The Google Tasks API only stores the date, not the time. Tasks from Google Tasks will show `—` instead of a time, even if you set one in the Google Tasks app. This is a Google limitation.

### ☑ Calendar events can't be "completed"
Calendar events are appointments, not actions — they don't have a completion state. Only tasks (`todo.*` entities) show the completion checkbox.

### 🐌 iCloud propagation delay
Reminders created in the Apple Reminders app on iPhone can take up to 1 hour to appear on Apple's public CalDAV server. Not a card issue. For lower latency, consider a self-hosted CalDAV server like [Radicale](https://radicale.org/) or [Baikal](https://sabre.io/baikal/).

## ⚠️ Disclaimer

This card is provided as-is for convenience. **Do not rely on it as the sole notification system for time-critical events** (medical appointments, flights, important deadlines, etc.). Always set independent notifications in your calendar app or phone for events that matter.

The card depends on third-party integrations (CalDAV, Google Tasks, etc.) which may have their own bugs, latencies, or limitations outside of this card's control. See [Known limitations](#%EF%B8%8F-known-limitations) above.

See the [LICENSE](LICENSE) for full terms — this software is provided without warranty of any kind.

## 🔧 Troubleshooting

**The card doesn't show up after installation**
- Did you reload the browser with Ctrl+F5 (hard refresh)?
- Check Settings → Dashboards → Resources: is the URL correct and the type "JavaScript Module"?
- Open the browser console (F12) and look for errors

**The refresh button gives an error**
- Make sure all calendar and todo entities exist and aren't disabled
- If you've edited the YAML manually, check there are no empty entries (`- ""`)

**Task completion doesn't work**
- Check the limitations section above
- Test the operation manually: Developer Tools → Actions → `todo.update_item`

**Colors don't apply**
- Make sure you clicked "Save" in the editor after picking a color
- Colors are stored in `entity_colors` in the YAML

## 💬 Discussion

Discussion and support thread on the Home Assistant community forum:
[Calendar & Tasks Card on the HA community](https://community.home-assistant.io/t/calendar-tasks-card-unified-agenda-for-events-and-todos/1010940)

## ☕ Support

If you enjoy this card and want to say thanks, a coffee is always welcome!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-korova.sq-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/korova.sq)

## 🤝 Contributing

Issues and pull requests are welcome. Please:
- Test changes against multiple integrations (Local To-do, CalDAV, Google Tasks if possible)
- Keep the code style consistent with the rest of the file
- Update the README if you add new options

## 📄 License

[MIT](LICENSE) © 2026 korova-sq
