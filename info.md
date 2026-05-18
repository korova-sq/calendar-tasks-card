# Calendar & Tasks Card

A unified agenda view for Home Assistant that combines calendar events and todo tasks in a single, clean timeline.

## Features

- **Unified agenda**: calendar events and todo tasks in one view, sorted by date
- **Smart sections**: separate areas for overdue, no-date, and completed tasks
- **Task completion**: tick tasks complete directly from the card (where the integration supports it)
- **Color coding**: assign custom colors to each calendar or list
- **Multilingual**: English and Italian, auto-detects from system
- **Time format**: 12h or 24h, follows system preferences
- **Week numbers**: ISO 8601 week numbers as visual separators
- **Relative time**: "Tomorrow", "In 3 days", "Yesterday" hints
- **Collapsible**: hide everything with one click to save dashboard space
- **Customizable actions**: tap, hold, double-tap actions per Home Assistant standards
- **Visual editor**: full configuration UI, no YAML required

## Quick install

1. Install via HACS (Frontend) or copy `calendar-tasks-card.js` to `/config/www/`
2. Add the resource: `/hacsfiles/calendar-tasks-card/calendar-tasks-card.js` (type: JavaScript Module)
3. Add the card to your dashboard and configure via the visual editor

See the [README](https://github.com/korova-sq/calendar-tasks-card) for full documentation.
