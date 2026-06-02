/**
 * calendar-tasks-card v1.3.0
 */

const CARD_VERSION = "1.3.0";

/* Palette di 12 colori predefiniti per le entità.
   Scelti per essere distinguibili tra loro e leggibili sia in tema chiaro che scuro.
   Possono essere assegnati esplicitamente via entity_colors nella config,
   oppure vengono assegnati in rotazione automatica alle entità senza colore. */
const COLOR_PALETTE = [
  { name: "Blu",       value: "#4285f4" },
  { name: "Verde",     value: "#34a853" },
  { name: "Rosso",     value: "#d93025" },
  { name: "Arancione", value: "#f9a825" },
  { name: "Viola",     value: "#9c27b0" },
  { name: "Rosa",      value: "#ec407a" },
  { name: "Ciano",     value: "#00bcd4" },
  { name: "Lime",      value: "#cddc39" },
  { name: "Marrone",   value: "#795548" },
  { name: "Grigio",    value: "#607d8b" },
  { name: "Indaco",    value: "#3f51b5" },
  { name: "Teal",      value: "#009688" },
];

/* Default centralizzati. Usati sia dalla card (per applicare valori mancanti)
   sia dall'editor (per rimuovere dal YAML salvato i valori uguali al default).
   Modifica qui per cambiare un default. */
const DEFAULT_ACTION = { action: "none" };
const DEFAULT_CONFIG = {
  title: "Agenda",
  show_title: true,
  show_refresh: true,
  days: 7,
  show_end_time: false,
  show_empty_days: false,
  show_source: false,
  show_description: true,
  show_location: false,
  location_clickable: false,
  show_completed: true,
  completed_days: 7,
  show_overdue: true,
  overdue_days: 0,
  allow_complete: false,
  show_relative_time: true,
  show_week_number: false,
  show_collapse_button: true,
  time_format: "auto",      // "auto" (segue locale), "12h", "24h"
  first_day_of_week: "auto", // "auto" (segue locale), "monday", "sunday", "saturday"
  language: "auto",         // "auto" (locale del browser/HA), "en" (inglese), "it" (italiano)
  refresh_interval: 300,
  limit_events_visible: false,    // se true, attiva la scrollbar e mostra solo max_events_visible giorni
  max_events_visible: 3,          // numero di giorni da mostrare quando limit_events_visible è true
  compact_mode: false,            // se true, riduce spazi verticali per card più compatta
  show_weather: false,            // master toggle per le funzionalità meteo
  weather_entity: "",             // entità weather di HA da usare (es. weather.home)
  show_weather_today: true,       // mostra widget meteo dettagliato in alto (solo oggi)
  show_weather_per_day: false,    // mostra meteo (icona + temp) sotto la data di ogni giorno
  entity_colors: {},
  tap_action: DEFAULT_ACTION,
  hold_action: DEFAULT_ACTION,
  double_tap_action: DEFAULT_ACTION,
};

/* ─── Stili card ────────────────────────────────────────────────── */
const STYLES = `
  :host {
    --ctc-bg:       var(--card-background-color, #fff);
    --ctc-surface:  var(--secondary-background-color, #f5f5f5);
    --ctc-border:   var(--divider-color, rgba(0,0,0,0.12));
    --ctc-text:     var(--primary-text-color, #212121);
    --ctc-muted:    var(--secondary-text-color, #727272);
    --ctc-hint:     var(--disabled-text-color, #9e9e9e);
    --ctc-today-bg: var(--accent-color, #4285f4);
    --ctc-today-fg: #ffffff;
    --ctc-bar-cal:  var(--ctc-dot-calendar, #4285f4);
    --ctc-bar-todo: var(--ctc-dot-task, #34a853);
    --ctc-bar-done: var(--disabled-text-color, #9e9e9e);
    --ctc-bar-overdue: var(--ctc-dot-overdue, #d93025);
  }
  ha-card { padding: 0; overflow: hidden; }

  .ctc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--ctc-border);
    gap: 8px;
    min-height: 36px;
  }
  .ctc-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--ctc-text);
    letter-spacing: 0.02em;
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .ctc-actions { display: flex; gap: 4px; }
  .ctc-icon-btn { background: none; border: none; cursor: pointer; color: var(--ctc-hint); padding: 4px; border-radius: 4px; display: flex; align-items: center; transition: background 0.15s; --mdc-icon-size: 18px; }
  .ctc-icon-btn:hover { background: var(--ctc-surface); color: var(--ctc-text); }

  /* Pulsanti nell'header del titolo (refresh + comprimi) */
  .ctc-header-actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }
  .ctc-header-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    color: var(--ctc-hint);
    padding: 4px 6px;
    border-radius: 6px;
    border: none;
    background: transparent;
    transition: background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ctc-header-btn:hover {
    background: var(--ctc-border);
    color: var(--ctc-text);
  }
  .ctc-header-btn ha-icon {
    --mdc-icon-size: 18px;
    transition: transform 0.2s ease;
  }
  .ctc-header-btn.collapsed ha-icon.chevron { transform: rotate(-90deg); }

  .ctc-loading { padding: 24px 16px; color: var(--ctc-hint); font-size: 13px; display: flex; align-items: center; gap: 8px; }

  /* ─── Riga giorno: data a sinistra in colonna, eventi a destra ─── */
  .ctc-day-row {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 12px;
    padding: 10px 16px;
    align-items: center;
  }
  .ctc-day-row + .ctc-day-row { border-top: 2px solid var(--ctc-border); }

  .ctc-date-col { display: flex; flex-direction: column; align-items: center; }
  .ctc-date-wd {
    font-size: 11px;
    color: var(--ctc-text);
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  .ctc-date-num {
    font-size: 26px;
    font-weight: 400;
    line-height: 1;
    color: var(--ctc-text);
    font-variant-numeric: tabular-nums;
    margin-top: 0;
  }
  .ctc-date-num.today {
    background: var(--ctc-today-bg);
    color: var(--ctc-today-fg);
    border-radius: 50%;
    width: 38px; height: 38px;
    font-size: 18px;
    display: flex; align-items: center; justify-content: center;
  }
  .ctc-date-month {
    font-size: 10px;
    color: var(--ctc-text);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 0;
    font-weight: 600;
  }

  /* ─── Eventi a destra ─── */
  .ctc-events-col { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

  /* Gruppo: barra unica a sinistra + lista eventi a destra */
  .ctc-event-group {
    display: flex;
    align-items: stretch;
    gap: 10px;
    min-width: 0;
  }
  .ctc-event-group-items { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .ctc-event-row {
    display: flex;
    align-items: stretch;
    gap: 10px;
    padding: 4px 0;
    min-width: 0;
  }
  .ctc-bar {
    width: 3px;
    border-radius: 2px;
    background: var(--ctc-bar-cal);
    flex-shrink: 0;
  }
  .ctc-bar.task { background: var(--ctc-bar-todo); }
  .ctc-bar.task-done { background: var(--ctc-bar-done); }
  .ctc-bar.overdue { background: var(--ctc-bar-overdue); }

  /* Checkbox circolare per completare task — stile iOS Reminders */
  .ctc-task-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1.5px solid var(--ctc-muted);
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    background: transparent;
    margin-top: 2px;
    -webkit-tap-highlight-color: transparent;
  }
  .ctc-task-checkbox:hover { border-color: var(--ctc-text); transform: scale(1.08); }
  .ctc-task-checkbox:active { transform: scale(0.92); }
  .ctc-task-checkbox.checked {
    background: var(--ctc-bar-done);
    border-color: var(--ctc-bar-done);
  }
  .ctc-task-checkbox.checked::after {
    content: "";
    display: block;
    width: 6px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px, -1px);
  }
  .ctc-task-checkbox.busy {
    opacity: 0.4;
    cursor: wait;
    pointer-events: none;
  }

  .ctc-event-main { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  .ctc-event-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--ctc-text);
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .ctc-event-title.done { text-decoration: line-through; color: var(--ctc-hint); }
  .ctc-event-sub {
    font-size: 11px;
    color: var(--ctc-hint);
    margin-top: 2px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .ctc-event-desc {
    font-size: 12px;
    color: var(--ctc-muted);
    margin-top: 3px;
    line-height: 1.35;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .ctc-event-desc.done { color: var(--ctc-hint); }
  .ctc-event-relative {
    font-size: 11px;
    color: var(--ctc-muted);
    margin-top: 2px;
    font-style: italic;
  }
  .ctc-event-relative.done { color: var(--ctc-hint); }
  .ctc-event-relative.overdue { color: var(--ctc-bar-overdue); font-style: normal; font-weight: 500; }
  /* Riga "location" sotto il titolo evento: icona pin + testo, opzionalmente cliccabile */
  .ctc-event-location {
    font-size: 12px;
    color: var(--ctc-muted);
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 4px;
    line-height: 1.35;
  }
  .ctc-event-location .ctc-loc-icon { --mdc-icon-size: 14px; flex-shrink: 0; }
  .ctc-event-location.clickable { color: var(--primary-color); cursor: pointer; text-decoration: none; }
  .ctc-event-location.clickable:hover { text-decoration: underline; }
  .ctc-event-time {
    font-size: 12px;
    color: var(--ctc-muted);
    white-space: nowrap;
    padding-top: 1px;
    font-variant-numeric: tabular-nums;
    text-align: right;
    min-width: 72px;
    flex-shrink: 0;
    align-self: center;
  }

  .ctc-empty-day { font-size: 12px; color: var(--ctc-hint); font-style: italic; padding: 4px 0; }
  .ctc-empty { padding: 24px 16px; font-size: 13px; color: var(--ctc-hint); font-style: italic; text-align: center; }

  /* Banner numero settimana */
  .ctc-week-banner {
    padding: 4px 16px;
    font-size: 10px;
    font-weight: 600;
    color: var(--ctc-hint);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: var(--secondary-background-color, rgba(0,0,0,0.03));
    border-top: 1px solid var(--ctc-border);
    border-bottom: 1px solid var(--ctc-border);
  }

  /* Quando .ctc-collapsed è sulla card, nascondiamo TUTTO eccetto l'header.
     Anche i banner delle settimane vengono nascosti. */
  .ctc-collapsed .ctc-day-row,
  .ctc-collapsed .ctc-section,
  .ctc-collapsed .ctc-empty,
  .ctc-collapsed .ctc-empty-day,
  .ctc-collapsed .ctc-week-banner { display: none !important; }
  /* Quando la card è collassata, anche il body wrapper si nasconde per evitare
     spazio vuoto sotto l'header */
  .ctc-collapsed .ctc-body { display: none !important; }
  /* Anche il widget meteo "oggi" si nasconde quando la card è collassata,
     così collassando si vede solo l'header (comportamento prevedibile) */
  .ctc-collapsed .ctc-weather-today { display: none !important; }

  /* Container scrollabile per il contenuto della card. Quando max_events_visible è impostato,
     il body diventa scrollabile internamente mostrando solo i primi N eventi (calcolato
     dinamicamente in JS dopo il render). L'header rimane fisso in cima. */
  .ctc-body {
    /* Scrollbar customizzata per Firefox - thin e con colore discreto */
    scrollbar-width: thin;
    scrollbar-color: var(--ctc-border) transparent;
    /* Arrotonda l'angolo inferiore destro per non sovrapporsi al border-radius della card */
    border-bottom-right-radius: inherit;
    border-bottom-left-radius: inherit;
  }
  /* Scrollbar per WebKit (Safari, Chrome) - sottile, discreta, con margini */
  .ctc-body::-webkit-scrollbar {
    width: 8px;
  }
  .ctc-body::-webkit-scrollbar-track {
    background: transparent;
    /* Margini in alto e in basso per non attaccarsi ai bordi della card */
    margin: 4px 0;
  }
  .ctc-body::-webkit-scrollbar-thumb {
    background-color: var(--ctc-border);
    border-radius: 4px;
    /* Border trasparente per "rimpicciolire" visivamente il thumb e dare più spazio */
    border: 2px solid transparent;
    background-clip: content-box;
  }
  .ctc-body::-webkit-scrollbar-thumb:hover {
    background-color: var(--ctc-muted);
    background-clip: content-box;
  }

  /* Modalità compatta: riduce gli spazi verticali per card più compatta */
  .ctc-compact .ctc-day-row { padding-top: 4px; padding-bottom: 4px; }
  .ctc-compact .ctc-event-row { padding-top: 4px; padding-bottom: 4px; }
  .ctc-compact .ctc-section { padding: 4px 16px 6px; }
  .ctc-compact .ctc-section-body { gap: 3px; }
  .ctc-compact .ctc-event-title { line-height: 1.2; }
  .ctc-compact .ctc-event-meta { line-height: 1.2; margin-top: 1px; }
  .ctc-compact .ctc-event-relative { margin-top: 1px; line-height: 1.2; }
  .ctc-compact .ctc-event-location { margin-top: 1px; line-height: 1.2; }
  .ctc-compact .ctc-event-desc { line-height: 1.25; }
  .ctc-compact .ctc-week-banner { padding-top: 4px; padding-bottom: 4px; }

  /* Sezioni globali in fondo (Senza data, Completati) */
  .ctc-section {
    padding: 8px 16px 10px;
    border-top: 1px solid var(--ctc-border);
  }
  .ctc-section-header {
    font-size: 10px;
    font-weight: 600;
    color: var(--ctc-hint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  .ctc-section-header.overdue { color: var(--ctc-bar-overdue); }
  .ctc-section-body { display: flex; flex-direction: column; gap: 6px; }

  /* Cursor pointer quando ci sono azioni configurate */
  .ctc-clickable { cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  .ctc-clickable:active { opacity: 0.7; transition: opacity 0.1s; }

  /* ─── Widget meteo "oggi" (in alto, sopra la lista) ─── */
  .ctc-weather-today {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--ctc-border);
    background: var(--secondary-background-color, rgba(0,0,0,0.03));
  }
  .ctc-weather-today-icon {
    --mdc-icon-size: 36px;
    color: var(--ctc-text);
    flex-shrink: 0;
  }
  .ctc-weather-today-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ctc-weather-today-temp {
    font-size: 16px;
    font-weight: 500;
    color: var(--ctc-text);
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .ctc-weather-today-temp .ctc-wt-condition {
    font-size: 13px;
    font-weight: 400;
    color: var(--ctc-muted);
  }
  .ctc-weather-today-details {
    font-size: 11px;
    color: var(--ctc-muted);
    letter-spacing: 0.02em;
  }

  /* ─── Meteo per giorno (sotto la data) ─── */
  .ctc-weather-day {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 11px;
    color: var(--ctc-muted);
    white-space: nowrap;
  }
  .ctc-weather-day-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
  }
  /* Placeholder per giorni senza previsione meteo: trattino più discreto */
  .ctc-weather-day-empty {
    color: var(--ctc-hint);
    opacity: 0.9;
  }
  /* Versione compatta: meteo per giorno più stretto */
  .ctc-compact .ctc-weather-day { margin-top: 2px; font-size: 10px; }
  .ctc-compact .ctc-weather-day-icon { --mdc-icon-size: 14px; }
  .ctc-compact .ctc-weather-today { padding: 6px 16px; }
  .ctc-compact .ctc-weather-today-icon { --mdc-icon-size: 30px; }

`;

/* ─── Stili editor ──────────────────────────────────────────────── */
const EDITOR_STYLES = `
  * { box-sizing: border-box; }
  .editor { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
  .section-title { font-size: 11px; font-weight: 600; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: 0.07em; padding-bottom: 6px; border-bottom: 1px solid var(--divider-color); margin-bottom: 10px; }
  .field-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 12px; }
  .field-row:last-child { margin-bottom: 0; }
  .field-row label { font-size: 14px; color: var(--primary-text-color); flex: 1; }
  .ctc-native-input {
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 4px;
    padding: 7px 10px;
    font-size: 14px;
    color: var(--primary-text-color, #212121);
    background: var(--card-background-color, #fff);
    outline: none;
    -webkit-appearance: none;
  }
  .ctc-native-input:focus { border-color: var(--accent-color, #4285f4); }
  .ctc-native-input.wide { width: 160px; }
  .ctc-native-input.narrow { width: 70px; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .toggle-row:last-child { margin-bottom: 0; }
  .toggle-row label { font-size: 14px; color: var(--primary-text-color); }
  .entity-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
  .entity-row { display: flex; align-items: center; gap: 8px; position: relative; }

  /* Cerchietto colorato + palette per scegliere il colore di un'entità */
  .color-wrap { position: relative; flex-shrink: 0; }
  .color-swatch {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
    box-shadow: 0 0 0 1px var(--divider-color, #ccc);
    cursor: pointer;
    padding: 0;
    transition: transform 0.1s ease;
  }
  .color-swatch:hover { transform: scale(1.1); }
  .color-palette {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 99999;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }
  .color-palette-item, .color-palette-auto {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1.5px solid var(--card-background-color, #fff);
    box-shadow: 0 0 0 1px var(--divider-color, #ccc);
    cursor: pointer;
    padding: 0;
    transition: transform 0.1s ease;
  }
  .color-palette-item:hover, .color-palette-auto:hover { transform: scale(1.15); }
  .color-palette-auto {
    background: transparent;
    color: var(--primary-text-color, #212121);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .color-palette-auto ha-icon { --mdc-icon-size: 14px; }
  .entity-wrap { flex: 1; position: relative; }
  .entity-wrap .ctc-native-input { width: 100%; }
  .autocomplete { position: absolute; top: 100%; left: 0; right: 0; z-index: 99999; background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #ccc); border-top: none; border-radius: 0 0 4px 4px; max-height: 240px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
  .ac-item { padding: 8px 12px; font-size: 13px; cursor: pointer; color: var(--primary-text-color); border-bottom: 1px solid var(--divider-color, #eee); }
  .ac-item:last-child { border-bottom: none; }
  .ac-item:hover { background: var(--secondary-background-color, #f5f5f5); }
  .ac-name { font-weight: 500; }
  .ac-id { font-size: 11px; color: var(--secondary-text-color); }
  .remove-btn { background: none; border: none; cursor: pointer; color: var(--secondary-text-color); padding: 4px; border-radius: 4px; display: flex; align-items: center; flex-shrink: 0; --mdc-icon-size: 18px; }
  .remove-btn:hover { color: var(--error-color, #b00020); }
  .add-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px dashed var(--divider-color, #ccc); border-radius: 6px; padding: 8px 12px; cursor: pointer; color: var(--secondary-text-color); font-size: 13px; width: 100%; transition: all 0.15s; --mdc-icon-size: 16px; }
  .add-btn:hover { background: var(--secondary-background-color); color: var(--primary-text-color); }
  .action-editor { padding: 8px 0 4px; border-bottom: 1px dashed var(--divider-color); margin-bottom: 8px; }
  .action-editor:last-child { border-bottom: none; }

  /* Versione compatta della sezione Interazioni: spazi ridotti tra le 3 azioni */
  .inter-compact .action-editor { padding: 4px 0 2px; margin-bottom: 4px; }
  .inter-compact .action-editor > label { margin-bottom: 2px; }
  .inter-compact .field-row { margin-bottom: 4px; }
  .action-label { font-size: 12px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 6px; }
  .action-params { padding-left: 8px; }
  select.ctc-native-input { -webkit-appearance: none; appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--secondary-text-color) 50%), linear-gradient(135deg, var(--secondary-text-color) 50%, transparent 50%); background-position: calc(100% - 14px) 50%, calc(100% - 9px) 50%; background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; padding-right: 24px; }

  /* Sezioni collassabili */
  .collapsible { border: 1px solid var(--divider-color); border-radius: 8px; margin-bottom: 6px; overflow: hidden; }
  .collapsible.open { overflow: visible; }
  .collapsible:last-child { margin-bottom: 0; }
  .collapsible-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; cursor: pointer; user-select: none;
    background: var(--card-background-color);
    transition: background 0.15s;
  }
  .collapsible-header:hover { background: var(--secondary-background-color); }
  .collapsible-title-wrap { display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
  .collapsible-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color, #888); flex-shrink: 0; }
  .collapsible-title { font-size: 14px; font-weight: 500; color: var(--primary-text-color); letter-spacing: 0.02em; }
  .collapsible-chevron {
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    transition: transform 0.2s ease;
  }
  .collapsible.open > .collapsible-header > .collapsible-chevron { transform: rotate(180deg); }
  .collapsible > .collapsible-body { padding: 10px 14px; border-top: 1px solid var(--divider-color); display: none; }
  .collapsible.open > .collapsible-body { display: block; }

  /* Tendine annidate (dentro Interazioni) */
  .collapsible.nested { margin-bottom: 6px; background: var(--secondary-background-color); }
  .collapsible.nested:last-child { margin-bottom: 0; }
  .collapsible.nested > .collapsible-header { padding: 8px 12px; background: transparent; }
  .collapsible.nested > .collapsible-header:hover { background: var(--card-background-color); }
  .collapsible.nested > .collapsible-header > .collapsible-title-wrap > .collapsible-title { font-size: 13px; }
  .collapsible.nested > .collapsible-header > .collapsible-chevron { --mdc-icon-size: 18px; }
  .collapsible.nested > .collapsible-body { padding: 8px 12px; }

  .sub-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin: 10px 0 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--divider-color);
  }
  .sub-title:first-child { margin-top: 0; }
`;

/* ─── Helper meteo ──────────────────────────────────────────────── */
/* Mappa le condizioni standard di HA (vedi
   https://www.home-assistant.io/integrations/weather/#condition-mapping)
   alle icone Material Design Icons (mdi:...).
   Le condizioni sono case-insensitive e con underscore. */
const WEATHER_ICONS = {
  "clear-night": "mdi:weather-night",
  "cloudy": "mdi:weather-cloudy",
  "exceptional": "mdi:alert-circle-outline",
  "fog": "mdi:weather-fog",
  "hail": "mdi:weather-hail",
  "lightning": "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  "partlycloudy": "mdi:weather-partly-cloudy",
  "pouring": "mdi:weather-pouring",
  "rainy": "mdi:weather-rainy",
  "snowy": "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy",
  "sunny": "mdi:weather-sunny",
  "windy": "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
};

/* Restituisce l'icona mdi per una condizione meteo, fallback su "weather-cloudy" */
function getWeatherIcon(condition) {
  if (!condition) return "mdi:weather-cloudy";
  return WEATHER_ICONS[String(condition).toLowerCase()] || "mdi:weather-cloudy";
}

/* Localizza la condizione meteo nella lingua scelta. Le entità weather di HA
   espongono la condizione in inglese (sunny, cloudy, rainy, ecc.) e HA stesso
   non sempre fornisce traduzioni accessibili dalla card. Mappa quelle più comuni. */
const WEATHER_LABELS = {
  it: {
    "clear-night": "Sereno",
    "cloudy": "Nuvoloso",
    "exceptional": "Eccezionale",
    "fog": "Nebbia",
    "hail": "Grandine",
    "lightning": "Temporale",
    "lightning-rainy": "Temporale e pioggia",
    "partlycloudy": "Parzialmente nuvoloso",
    "pouring": "Pioggia intensa",
    "rainy": "Pioggia",
    "snowy": "Neve",
    "snowy-rainy": "Neve e pioggia",
    "sunny": "Soleggiato",
    "windy": "Ventoso",
    "windy-variant": "Ventoso",
  },
  en: {
    "clear-night": "Clear",
    "cloudy": "Cloudy",
    "exceptional": "Exceptional",
    "fog": "Fog",
    "hail": "Hail",
    "lightning": "Thunderstorm",
    "lightning-rainy": "Thunderstorm and rain",
    "partlycloudy": "Partly cloudy",
    "pouring": "Heavy rain",
    "rainy": "Rainy",
    "snowy": "Snow",
    "snowy-rainy": "Snow and rain",
    "sunny": "Sunny",
    "windy": "Windy",
    "windy-variant": "Windy",
  },
};

function getWeatherLabel(condition, lang) {
  if (!condition) return "";
  const dict = WEATHER_LABELS[lang] || WEATHER_LABELS.en;
  return dict[String(condition).toLowerCase()] || condition;
}

/* Estrae la previsione meteo per uno specifico giorno da un array di forecast.
   Da HA 2024.4 le previsioni NON sono più negli attributi dell'entità, vanno
   recuperate via servizio weather.get_forecasts. Questa funzione opera sull'array
   già recuperato. Confronta solo la data (no orario). Ritorna null se non trovata. */
function getForecastForDay(forecastArray, targetDate) {
  if (!Array.isArray(forecastArray) || forecastArray.length === 0) return null;
  const targetKey = dayKey(targetDate);
  for (const fc of forecastArray) {
    if (!fc.datetime) continue;
    const fcDate = new Date(fc.datetime);
    if (isNaN(fcDate)) continue;
    if (dayKey(fcDate) === targetKey) return fc;
  }
  return null;
}

/* ─── Helpers ───────────────────────────────────────────────────── */

/* Restituisce il nome breve del giorno della settimana per una data,
   nel locale richiesto (es. "Lun" / "Mon" / "月"). 3 caratteri tipici. */
function getShortDayName(date, locale) {
  try {
    return date.toLocaleDateString(locale || "it-IT", { weekday: "short" })
      .replace(/\.$/, ""); // alcune locali aggiungono "."
  } catch (e) {
    return date.toLocaleDateString("it-IT", { weekday: "short" });
  }
}

/* Nome breve del mese per una data, nel locale richiesto. */
function getShortMonthName(date, locale) {
  try {
    return date.toLocaleDateString(locale || "it-IT", { month: "short" })
      .replace(/\.$/, "");
  } catch (e) {
    return date.toLocaleDateString("it-IT", { month: "short" });
  }
}

function fmtTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

/* Versione configurabile di fmtTime: il formato (12h o 24h) viene scelto in base
   alla config. "auto" segue il locale browser, "12h" forza AM/PM, "24h" forza
   il formato 24 ore. */
function fmtTimeFormatted(dateStr, format, locale) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const opts = { hour: "2-digit", minute: "2-digit" };
  if (format === "12h") opts.hour12 = true;
  else if (format === "24h") opts.hour12 = false;
  // "auto" → non passa hour12, lascia decidere al locale
  try {
    return d.toLocaleTimeString(locale || "it-IT", opts);
  } catch (e) {
    return d.toLocaleTimeString("it-IT", opts);
  }
}

/* Numero della settimana ISO 8601 per una data. Algoritmo standard.
   Settimana 1 = quella che contiene il primo giovedì dell'anno. */
function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Sposta al giovedì di questa settimana (ISO: lunedì=1, giovedì=4)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  // Primo gennaio dell'anno corrispondente
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/* Risolve il primo giorno della settimana (0=domenica, 1=lunedì, 6=sabato).
   "auto" → segue il locale: IT/EU = lunedì, US = domenica, MEDIO ORIENTE = sabato. */
function resolveFirstDayOfWeek(configValue, locale) {
  if (configValue === "monday") return 1;
  if (configValue === "sunday") return 0;
  if (configValue === "saturday") return 6;
  // auto: deduce dal locale
  const lang = (locale || "en").toLowerCase().split("-")[0];
  // Locali tipicamente con domenica come primo giorno
  const sundayFirst = ["en", "ja", "ko", "zh", "th", "id", "vi"];
  // Locali con sabato come primo giorno (paesi arabi)
  const saturdayFirst = ["ar", "he", "fa"];
  if (sundayFirst.includes(lang)) return 0;
  if (saturdayFirst.includes(lang)) return 6;
  // Tutto il resto (it, fr, de, es, pt, etc.) = lunedì
  return 1;
}

/* Stringhe localizzate. Per ora supporto italiano e inglese.
   La funzione t(key, lang) restituisce la stringa nella lingua scelta. */
const I18N = {
  it: {
    agenda: "Agenda",
    today: "Oggi",
    tomorrow: "Domani",
    yesterday: "Ieri",
    no_events: (n) => n === 1 ? "Nessun evento nel prossimo giorno" : `Nessun evento nei prossimi ${n} giorni`,
    no_events_day: "Nessun evento",
    all_day: "Tutto il giorno",
    overdue: "Scaduti",
    no_date: "Senza data",
    completed: "Completati",
    open_in_maps: "Apri in Mappe",
    weather_today: "Oggi",
    weather_min: "Min",
    weather_max: "Max",
    weather_humidity: "Umidità",
    week_short: "Sett.",
    collapse_all: "Comprimi tutto",
    expand_all: "Espandi tutto",
    refresh: "Aggiorna",
    days_missing_one: "Manca un giorno",
    days_missing_n: (n) => `Mancano ${n} giorni`,
    week_missing_one: "Manca una settimana",
    weeks_missing_two: "Mancano due settimane",
    month_missing_one: "Manca circa un mese",
    months_missing_n: (n) => `Mancano circa ${n} mesi`,
    overdue_one: "Scaduto da un giorno",
    overdue_n: (n) => `Scaduto da ${n} giorni`,
    overdue_week_one: "Scaduto da una settimana",
    overdue_weeks_two: "Scaduto da due settimane",
    overdue_month_one: "Scaduto da circa un mese",
    overdue_months_n: (n) => `Scaduto da circa ${n} mesi`,
    days: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
    months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
  },
  en: {
    agenda: "Agenda",
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    no_events: (n) => n === 1 ? "No events in the next day" : `No events in the next ${n} days`,
    no_events_day: "No events",
    all_day: "All day",
    overdue: "Overdue",
    no_date: "No date",
    completed: "Completed",
    open_in_maps: "Open in Maps",
    weather_today: "Today",
    weather_min: "Min",
    weather_max: "Max",
    weather_humidity: "Humidity",
    week_short: "Wk",
    collapse_all: "Collapse all",
    expand_all: "Expand all",
    refresh: "Refresh",
    days_missing_one: "In 1 day",
    days_missing_n: (n) => `In ${n} days`,
    week_missing_one: "In 1 week",
    weeks_missing_two: "In 2 weeks",
    month_missing_one: "In about 1 month",
    months_missing_n: (n) => `In about ${n} months`,
    overdue_one: "1 day overdue",
    overdue_n: (n) => `${n} days overdue`,
    overdue_week_one: "1 week overdue",
    overdue_weeks_two: "2 weeks overdue",
    overdue_month_one: "About 1 month overdue",
    overdue_months_n: (n) => `About ${n} months overdue`,
    days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    months: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  },
};

/* Risolve la lingua effettiva da usare. Se config = "auto", prova prima il
   locale di HA (passato come hassLanguage), poi il navigator.language, poi
   fallback su "en". Se la lingua scelta non è supportata, usa "en". */
function resolveLanguage(configLang, hassLanguage) {
  if (configLang && configLang !== "auto") {
    return I18N[configLang] ? configLang : "en";
  }
  const candidates = [
    hassLanguage,
    (typeof navigator !== "undefined" && navigator.language) || "",
  ];
  for (const c of candidates) {
    if (!c) continue;
    const short = c.toLowerCase().split("-")[0];
    if (I18N[short]) return short;
  }
  return "en";
}

function t(key, lang) {
  const dict = I18N[lang] || I18N.en;
  return dict[key] !== undefined ? dict[key] : (I18N.en[key] || key);
}

/* Restituisce il colore associato a un'entità, in questo ordine di priorità:
   1. Colore esplicito in config.entity_colors[entityId]
   2. Colore assegnato in rotazione dalla palette in base alla posizione
      dell'entità nella lista combinata (calendars + todos)
   La rotazione è deterministica: la stessa entità nella stessa config ottiene
   sempre lo stesso colore. */
function getEntityColor(entityId, config) {
  const explicit = config.entity_colors && config.entity_colors[entityId];
  if (explicit) return explicit;
  // Rotazione: posizione dell'entità nella lista combinata
  const allEntities = [...(config.calendars || []), ...(config.todos || [])];
  const idx = allEntities.indexOf(entityId);
  if (idx < 0) return COLOR_PALETTE[0].value;
  return COLOR_PALETTE[idx % COLOR_PALETTE.length].value;
}

/* Valida un entity_id Home Assistant: formato "dominio.nome", caratteri minuscoli,
   numeri e underscore. Filtra stringhe vuote, undefined, righe non compilate. */
function isValidEntityId(id) {
  return typeof id === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(id);
}

/* Restituisce una stringa relativa per quanto manca/è passato rispetto a oggi,
   nella lingua scelta. Confronto a livello di giorno (mezzanotte). */
function formatRelativeTime(taskDate, referenceDate, lang) {
  if (!taskDate) return null;
  const ref = referenceDate || new Date();
  const refMidnight = new Date(ref);
  refMidnight.setHours(0, 0, 0, 0);
  const taskMidnight = new Date(taskDate);
  taskMidnight.setHours(0, 0, 0, 0);
  const diffMs = taskMidnight.getTime() - refMidnight.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays === 0) return t("today", lang);
  if (diffDays === 1) return t("tomorrow", lang);
  if (diffDays === -1) return t("yesterday", lang);

  if (diffDays > 0) {
    // Futuro
    if (diffDays === 7) return t("week_missing_one", lang);
    if (diffDays === 14) return t("weeks_missing_two", lang);
    if (diffDays > 1 && diffDays < 30) {
      const fn = t("days_missing_n", lang);
      return typeof fn === "function" ? fn(diffDays) : `${diffDays}`;
    }
    if (diffDays >= 30 && diffDays < 60) return t("month_missing_one", lang);
    if (diffDays >= 60 && diffDays < 365) {
      const months = Math.round(diffDays / 30);
      const fn = t("months_missing_n", lang);
      return typeof fn === "function" ? fn(months) : `${months}`;
    }
    const fn = t("days_missing_n", lang);
    return typeof fn === "function" ? fn(diffDays) : `${diffDays}`;
  } else {
    // Passato
    const past = -diffDays;
    if (past === 7) return t("overdue_week_one", lang);
    if (past === 14) return t("overdue_weeks_two", lang);
    if (past > 1 && past < 30) {
      const fn = t("overdue_n", lang);
      return typeof fn === "function" ? fn(past) : `${past}`;
    }
    if (past >= 30 && past < 60) return t("overdue_month_one", lang);
    if (past >= 60 && past < 365) {
      const months = Math.round(past / 30);
      const fn = t("overdue_months_n", lang);
      return typeof fn === "function" ? fn(months) : `${months}`;
    }
    const fn = t("overdue_n", lang);
    return typeof fn === "function" ? fn(past) : `${past}`;
  }
}

/* Prepara la descrizione per il render:
   - Converte i <br> e </p> in newline
   - Rimuove solo tag HTML "validi" (con nome tag, no testo arbitrario tra < >)
   - Decodifica entità HTML basilari
   - Fa l'escape finale per il re-inserimento via innerHTML
   - Il CSS poi gestisce i newline con white-space: pre-wrap */
function sanitizeDescription(raw) {
  if (!raw) return "";
  let s = String(raw);
  // Converte <br> e </p> in newline prima dello strip
  s = s.replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\s*\/\s*p\s*>/gi, "\n");
  // Strip dei soli tag HTML validi: <tagname...> o </tagname> — non mangia "< testo >"
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, "");
  // Decodifica entità HTML basilari (Google Calendar serve testo già HTML-encoded)
  s = s.replace(/&nbsp;/g, " ")
       .replace(/&lt;/g, "<")
       .replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'")
       .replace(/&amp;/g, "&");
  // Escape finale per re-inserire via innerHTML in sicurezza
  s = s.replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;");
  // Collassa newline multipli ma preserva i singoli
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

function isAllDay(event) { return !event.start.dateTime; }
function dayKey(date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }

/* Normalizza una location multi-riga (CalDAV iCloud restituisce "Rho\nMI, Italia")
   in una stringa pulita su singola riga per la visualizzazione.
   Rimuove righe vuote, unisce con ", ". */
function formatLocation(raw) {
  if (!raw) return "";
  const cleaned = String(raw)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(", ");
  return cleaned;
}

/* Genera URL per aprire Google Maps con il luogo. Funziona su tutte le piattaforme:
   - Desktop: apre Google Maps web
   - iOS Safari: spesso offre di aprire in Apple Maps
   - Android: apre Google Maps app */
function buildMapsUrl(location) {
  if (!location) return "";
  const encoded = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

/* Escape sicuro di testo per uso in attributi HTML (es. title, href).
   Diverso da escape per body HTML perché va in contesti diversi. */
function escapeHtmlAttribute(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Parse robusto della data di scadenza di un task.
   Google Tasks può restituire:
   - "2026-05-12"               → date-only (interpretato come UTC altrimenti)
   - "2026-05-12T00:00:00+0000" → ISO con orario UTC
   - "2026-05-12T15:30:00+0200" → ISO con orario locale
   Per le date-only forziamo la mezzanotte LOCALE per non perdere un giorno. */
function parseDueDate(due) {
  if (!due) return null;
  // Match esatto YYYY-MM-DD (eventualmente con T00:00 senza timezone)
  const m = String(due).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s]00:00(?::00)?)?$/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  }
  // ISO standard con orario / timezone esplicito → lascia fare a Date
  const d = new Date(due);
  return isNaN(d) ? null : d;
}

/* ─── Blocca shortcut HA su tutti gli input della pagina ────────── */
function blockHAShortcuts(input) {
  // Intercetta in fase di capture sul documento — l'unico modo
  // per fermare HA prima che processi il tasto
  const handler = (e) => {
    if (document.activeElement === input ||
        input.getRootNode()?.activeElement === input) {
      e.stopImmediatePropagation();
    }
  };
  document.addEventListener("keydown", handler, true);
  input.addEventListener("blur", () => {
    // Lascia un tick poi rimuove, per non interferire con tab navigation
    setTimeout(() => document.removeEventListener("keydown", handler, true), 100);
  }, { once: false });
  input.addEventListener("focus", () => {
    document.addEventListener("keydown", handler, true);
  });
}

/* ─── Gestione azioni standard Home Assistant ───────────────────── */
/* Replica il comportamento di tap_action/hold_action/double_tap_action
   delle card built-in di HA. Le azioni supportate sono:
   - more-info: apre il popup "Ulteriori informazioni" dell'entità
   - toggle: chiama homeassistant/toggle sull'entità
   - navigate: cambia URL del dashboard via History API
   - url: apre un URL in nuova scheda
   - call-service / perform-action: chiama un servizio HA
   - assist: apre il pannello Assist
   - none: nessuna azione */
function fireHassEvent(node, type, detail) {
  const event = new Event(type, { bubbles: true, cancelable: false, composed: true });
  event.detail = detail || {};
  node.dispatchEvent(event);
  return event;
}

function handleHaAction(node, hass, actionConfig, entityIdFallback) {
  if (!actionConfig || actionConfig.action === "none") return;
  const action = actionConfig.action || "more-info";
  switch (action) {
    case "more-info": {
      const entity = actionConfig.entity || entityIdFallback;
      if (entity) fireHassEvent(node, "hass-more-info", { entityId: entity });
      break;
    }
    case "toggle": {
      const entity = actionConfig.entity || entityIdFallback;
      if (!entity || !hass) return;
      hass.callService("homeassistant", "toggle", { entity_id: entity });
      break;
    }
    case "navigate": {
      if (!actionConfig.navigation_path) return;
      window.history.pushState(null, "", actionConfig.navigation_path);
      fireHassEvent(window, "location-changed", { replace: false });
      break;
    }
    case "url": {
      if (!actionConfig.url_path) return;
      window.open(actionConfig.url_path, "_blank", "noopener,noreferrer");
      break;
    }
    case "call-service":
    case "perform-action": {
      const svc = actionConfig.service || actionConfig.perform_action;
      if (!svc || !hass) return;
      const [domain, service] = svc.split(".");
      if (!domain || !service) return;
      const data = actionConfig.data || actionConfig.service_data || {};
      const target = actionConfig.target || {};
      hass.callService(domain, service, data, target);
      break;
    }
    case "assist": {
      fireHassEvent(node, "show-dialog", {
        dialogTag: "ha-voice-command-dialog",
        dialogImport: () => Promise.resolve(),
        dialogParams: {
          pipeline_id: actionConfig.pipeline_id || "last_used",
          start_listening: actionConfig.start_listening !== false,
        },
      });
      break;
    }
  }
}

/* Associa tap/double-tap/hold a un elemento con feedback per long press.
   Restituisce una funzione di cleanup per rimuovere i listener. */
function attachActionListeners(element, getConfig, onAction) {
  let holdTimer = null;
  let isHold = false;
  let tapTimer = null;
  let lastTapTime = 0;
  const HOLD_MS = 500;
  const DOUBLE_TAP_MS = 250;

  const onDown = (e) => {
    isHold = false;
    holdTimer = setTimeout(() => {
      isHold = true;
      holdTimer = null;
      const cfg = getConfig();
      if (cfg.hold && cfg.hold.action && cfg.hold.action !== "none") {
        e.preventDefault();
        onAction("hold");
      }
    }, HOLD_MS);
  };

  const onUp = (e) => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (isHold) return; // hold già scattato, ignora il click
    const cfg = getConfig();
    const hasDouble = cfg.double_tap && cfg.double_tap.action && cfg.double_tap.action !== "none";
    const now = Date.now();
    if (hasDouble) {
      if (now - lastTapTime < DOUBLE_TAP_MS) {
        // È un double-tap
        if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; }
        lastTapTime = 0;
        onAction("double_tap");
      } else {
        // Potrebbe essere il primo di un double-tap o un tap singolo
        lastTapTime = now;
        tapTimer = setTimeout(() => {
          tapTimer = null;
          lastTapTime = 0;
          onAction("tap");
        }, DOUBLE_TAP_MS);
      }
    } else {
      // Nessun double tap configurato: fire subito il tap
      onAction("tap");
    }
  };

  const onCancel = () => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  };

  element.addEventListener("pointerdown", onDown);
  element.addEventListener("pointerup", onUp);
  element.addEventListener("pointerleave", onCancel);
  element.addEventListener("pointercancel", onCancel);

  return () => {
    element.removeEventListener("pointerdown", onDown);
    element.removeEventListener("pointerup", onUp);
    element.removeEventListener("pointerleave", onCancel);
    element.removeEventListener("pointercancel", onCancel);
    if (holdTimer) clearTimeout(holdTimer);
    if (tapTimer) clearTimeout(tapTimer);
  };
}

/* ─── Card principale ───────────────────────────────────────────── */
class CalendarTasksCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._events = [];
    this._tasks = [];
    this._weatherForecast = [];  // array di previsioni meteo (recuperato via weather.get_forecasts)
    this._loading = false;
    this._lastFetch = null;
  }

  setConfig(config) {
    if (!config) throw new Error("Configurazione mancante");
    // Salva i valori precedenti che ci servono per decidere se refetchare il forecast
    const prevWeatherEntity = this._config?.weather_entity;
    const prevPerDay = this._config?.show_weather_per_day;
    this._config = {
      ...DEFAULT_CONFIG,
      calendars: [], todos: [],
      ...config,
    };
    // Sanitizza calendars e todos: scarta righe vuote o malformate.
    // Protegge da YAML scritti a mano e da "Aggiungi" lasciati incompiuti.
    if (Array.isArray(this._config.calendars)) {
      this._config.calendars = this._config.calendars.filter(isValidEntityId);
    } else {
      this._config.calendars = [];
    }
    if (Array.isArray(this._config.todos)) {
      this._config.todos = this._config.todos.filter(isValidEntityId);
    } else {
      this._config.todos = [];
    }
    // Se la config del meteo è cambiata in modo "rilevante" rispetto alla prec.
    // (entità o show_weather_per_day), refetch del forecast: serve nuovamente
    // dopo che l'utente attiva l'opzione "per day" senza ricaricare la card.
    const weatherChanged = this._hass && (
      (prevWeatherEntity !== this._config.weather_entity) ||
      (prevPerDay !== this._config.show_weather_per_day && this._config.show_weather)
    );
    if (weatherChanged) {
      this._fetchWeatherForecast().then(fc => {
        this._weatherForecast = fc;
        this._render();
      });
    } else {
      this._render();
    }
  }

  set hass(hass) {
    const wasNull = !this._hass;
    const oldWeather = this._hass && this._config.weather_entity
      ? this._hass.states[this._config.weather_entity]
      : null;
    this._hass = hass;
    const now = Date.now();
    const interval = (this._config.refresh_interval || 300) * 1000;
    if (wasNull || !this._lastFetch || (now - this._lastFetch) > interval) {
      this._fetchAll();
    } else if (this._config.show_weather && this._config.weather_entity) {
      // Re-render se è cambiato lo stato dell'entità weather (es. nuova previsione)
      // Non serve fare un fetch completo, basta riaggiornare la UI con i dati freschi.
      const newWeather = hass.states[this._config.weather_entity];
      if (oldWeather && newWeather && oldWeather.state !== newWeather.state) {
        this._render();
      }
    }
  }

  async _fetchAll(force = false) {
    if (!this._hass) return;
    this._loading = true;
    this._render();

    // Se l'utente ha richiesto un refresh forzato, chiede prima a HA di
    // risincronizzare le entità con il loro backend (Google, CalDAV, Microsoft, ecc.).
    // Salta questo passaggio per i refresh automatici di background.
    if (force) {
      // Filtra solo gli entity_id validi: stringhe vuote o malformate vengono scartate
      // per evitare l'errore "invalid entity ID" di HA.
      const allEntities = [
        ...(this._config.calendars || []),
        ...(this._config.todos || []),
      ].filter(isValidEntityId);

      console.log("[ctc] Force update — entità da aggiornare:", allEntities);

      if (allEntities.length > 0) {
        // Chiamiamo update_entity una entità alla volta. Alcune versioni di HA
        // rifiutano una lista nell'entity_id se passata come service_data.
        await Promise.all(
          allEntities.map(id =>
            this._hass.callService("homeassistant", "update_entity", { entity_id: id })
              .catch(err => console.warn(`[ctc] update_entity fallito per "${id}":`, err))
          )
        );
        // Lascia tempo all'integrazione di rispondere prima di rileggere lo stato.
        // 1.5s è un buon compromesso: abbastanza per Google/CalDAV in condizioni normali.
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.warn("[ctc] Force update saltato: nessun entity_id valido in config", {
          calendars: this._config.calendars,
          todos: this._config.todos,
        });
      }
    }

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (this._config.days || 7));
    const [events, tasks, weatherForecast] = await Promise.all([
      this._fetchCalendarEvents(start, end),
      this._fetchTodoItems(),
      this._fetchWeatherForecast(),
    ]);
    this._events = events;
    this._tasks = tasks;
    this._weatherForecast = weatherForecast;
    this._loading = false;
    this._lastFetch = Date.now();
    this._render();
  }

  async _fetchCalendarEvents(start, end) {
    const calendars = (this._config.calendars || []).filter(isValidEntityId);
    if (!calendars.length) return [];
    const results = [];
    for (const id of calendars) {
      try {
        const resp = await this._hass.callApi("GET", `calendars/${id}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
        if (Array.isArray(resp)) resp.forEach(ev => results.push({ ...ev, _source: id }));
      } catch (e) { console.warn(`[ctc] Errore calendario ${id}:`, e); }
    }
    results.sort((a, b) => new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date));
    return results;
  }

  async _fetchTodoItems() {
    const todos = (this._config.todos || []).filter(isValidEntityId);
    if (!todos.length) return [];
    const results = [];
    for (const id of todos) {
      try {
        const resp = await this._hass.connection.sendMessagePromise({
          type: "call_service", domain: "todo", service: "get_items",
          service_data: { entity_id: id, status: ["needs_action", "completed"] },
          return_response: true,
        });
        (resp?.response?.[id]?.items || []).forEach(item => results.push({ ...item, _source: id }));
      } catch (e) { console.warn(`[ctc] Errore todo ${id}:`, e); }
    }
    return results;
  }

  /* Recupera la previsione meteo daily dall'entità weather configurata.
     Da HA 2024.4, l'attributo `forecast` è stato rimosso. Bisogna chiamare il
     servizio weather.get_forecasts con `type: daily` e `return_response: true`.
     Restituisce un array di oggetti previsione (datetime, condition, temperature,
     templow, ecc.) oppure array vuoto se non disponibile/non configurato. */
  async _fetchWeatherForecast() {
    if (!this._hass) return [];
    if (!this._config.show_weather) return [];
    const entityId = this._config.weather_entity;
    if (!entityId || !isValidEntityId(entityId)) return [];
    // Solo se mostriamo il meteo per ogni giorno serve davvero il forecast.
    // Se mostriamo solo il widget "oggi", basta lo state corrente dell'entità.
    if (!this._config.show_weather_per_day) return [];
    try {
      const resp = await this._hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        service_data: { type: "daily" },
        target: { entity_id: entityId },
        return_response: true,
      });
      return resp?.response?.[entityId]?.forecast || [];
    } catch (e) {
      console.warn(`[ctc] Errore fetch weather forecast ${entityId}:`, e);
      return [];
    }
  }

  /* Cambia lo stato di un task (needs_action <-> completed) tramite il servizio
     todo.update_item. Aggiorna ottimisticamente la UI (la classe checked appare
     subito), poi rilegge i dati per sincronizzarsi con lo stato reale. */
  async _toggleTaskComplete(checkbox) {
    if (!this._hass) return;
    const entityId = checkbox.getAttribute("data-entity-id");
    const uid = checkbox.getAttribute("data-uid");
    const summary = checkbox.getAttribute("data-summary");
    const currentStatus = checkbox.getAttribute("data-current-status");
    if (!entityId || !summary) {
      console.warn("[ctc] Toggle task: dati incompleti", { entityId, summary });
      return;
    }
    const newStatus = currentStatus === "completed" ? "needs_action" : "completed";

    // Aggiornamento ottimistico: aggiorna subito la UI per dare feedback istantaneo
    checkbox.classList.add("busy");
    if (newStatus === "completed") checkbox.classList.add("checked");
    else checkbox.classList.remove("checked");

    // todo.update_item identifica il task tramite il campo `item`. HA accetta sia
    // l'uid sia il summary. Preferiamo uid quando disponibile, fallback su summary.
    const itemIdentifier = uid && uid !== "undefined" && uid !== "" ? uid : summary;

    try {
      await this._hass.callService("todo", "update_item", {
        entity_id: entityId,
        item: itemIdentifier,
        status: newStatus,
      });
      // Aggiorna lo stato locale in memoria così la prossima _render() (anche
      // automatica) rifletterà subito il nuovo stato, senza dover riaspettare il fetch
      const localTask = this._tasks.find(t => t._source === entityId &&
        ((t.uid && t.uid === uid) || (t.summary || t.name) === summary));
      if (localTask) localTask.status = newStatus;
      // Forza un re-render per spostare il task tra le sezioni (es. attivo → completati)
      this._render();
    } catch (err) {
      console.warn("[ctc] Errore toggle task:", err);
      // Ripristina stato visivo precedente in caso di errore
      checkbox.classList.remove("busy");
      if (currentStatus === "completed") checkbox.classList.add("checked");
      else checkbox.classList.remove("checked");
    }
  }

  _render() {
    const shadow = this.shadowRoot;
    shadow.innerHTML = "";
    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // Risolvi lingua e locale per i testi e i formati data/ora
    const hassLanguage = this._hass?.locale?.language || this._hass?.language || null;
    const lang = resolveLanguage(this._config.language, hassLanguage);
    // displayLocale viene usato dall'API browser per nomi giorni/mesi e orari.
    // Se la lingua è specificata esplicitamente, usa quella; altrimenti il locale HA.
    const displayLocale = this._config.language && this._config.language !== "auto"
      ? this._config.language
      : (hassLanguage || (typeof navigator !== "undefined" ? navigator.language : "it-IT"));
    const timeFormat = this._config.time_format || "auto";
    const firstDayOfWeek = resolveFirstDayOfWeek(this._config.first_day_of_week, displayLocale);

    let card = document.createElement("ha-card");

    // Stato collapsed (persistente). Calcolato PRIMA dell'header perché serve
    // per decidere l'icona del pulsante e applicare la classe alla card.
    const collapseStorageKey = `ctc:collapsed:${this._config.title || "default"}`;
    let isCollapsed = false;
    try {
      isCollapsed = localStorage.getItem(collapseStorageKey) === "1";
    } catch (e) { /* localStorage può essere disabilitato in alcuni contesti */ }
    this._isCollapsed = isCollapsed;
    if (isCollapsed) card.classList.add("ctc-collapsed");

    // Costruisci i pulsanti header (refresh + comprimi)
    const showRefreshBtn = this._config.show_refresh !== false;
    const showCollapseBtn = !!this._config.show_collapse_button;
    let headerActions = "";
    if (showRefreshBtn) {
      headerActions += `<button class="ctc-header-btn" id="ctc-refresh" title="${t("refresh", lang)}"><ha-icon icon="mdi:refresh"></ha-icon></button>`;
    }
    if (showCollapseBtn) {
      headerActions += `<button class="ctc-header-btn ${isCollapsed ? "collapsed" : ""}" id="ctc-collapse-all" title="${isCollapsed ? t("expand_all", lang) : t("collapse_all", lang)}"><ha-icon icon="mdi:chevron-up" class="chevron"></ha-icon></button>`;
    }

    // Header: titolo + pulsanti. Se né titolo né pulsanti sono attivi, niente header.
    const titleText = this._config.title || t("agenda", lang);
    const hasHeader = this._config.show_title !== false || headerActions;
    const headerHtml = hasHeader ? `
      <div class="ctc-header">
        <span class="ctc-title">${this._config.show_title !== false ? titleText : ""}</span>
        ${headerActions ? `<span class="ctc-header-actions">${headerActions}</span>` : ""}
      </div>` : "";

    // Imposto SOLO l'header su card.innerHTML.
    // Poi creo un body separato come elemento DOM, che riempirò con il contenuto.
    // Questo evita il problema dell'auto-closing dei div quando si usa innerHTML += più volte.
    card.innerHTML = headerHtml;

    // Body wrapper: container scrollabile.
    // Se max_events_visible > 0, il body diventa scrollabile e mostra solo i primi N giorni.
    // L'altezza viene calcolata dopo il rendering (vedi più sotto, dopo l'appendChild).
    const body = document.createElement("div");
    body.className = "ctc-body";
    // Applico la classe compact_mode al body se richiesto (riduce spazi)
    if (this._config.compact_mode === true) {
      body.classList.add("ctc-compact");
    }
    // Reference shuffle: cardElement = ha-card, card = body (per innerHTML += sotto)
    const cardElement = card;
    card = body;
    this._cardElement = cardElement;

    if (this._loading) {
      card.innerHTML += `<div class="ctc-loading"><ha-circular-progress active size="small"></ha-circular-progress></div>`;
      cardElement.appendChild(body);
      shadow.appendChild(cardElement);
      return;
    }
    const today = new Date();
    const todayKey = dayKey(today);
    const numDays = this._config.days || 7;

    // Funzione condivisa per renderizzare una riga task (attivo o completato)
    const renderTaskRow = (task, done) => {
      const sub = this._config.show_source !== false ? `<div class="ctc-event-sub">${task._source.replace("todo.", "")}</div>` : "";
      const parsed = parseDueDate(task.due);
      const hasTime = parsed && (parsed.getHours() !== 0 || parsed.getMinutes() !== 0);
      let timeStr;
      if (hasTime) {
        timeStr = fmtTimeFormatted(parsed.toISOString(), timeFormat, displayLocale);
      } else {
        // Senza orario (anche se ha la data) o senza data: trattino
        timeStr = "—";
      }
      const descClean = this._config.show_description ? sanitizeDescription(task.description) : "";
      const desc = descClean ? `<div class="ctc-event-desc ${done ? "done" : ""}">${descClean}</div>` : "";
      // Tempo relativo "Manca X giorni" / "Scaduto da N giorni" (se abilitato e c'è una data)
      let rel = "";
      if (this._config.show_relative_time && parsed && !done) {
        const relText = formatRelativeTime(parsed, undefined, lang);
        if (relText) {
          // Marca come overdue se è nel passato (testo rosso, vedi CSS)
          const taskMidnight = new Date(parsed);
          taskMidnight.setHours(0, 0, 0, 0);
          const isPast = taskMidnight.getTime() < new Date().setHours(0, 0, 0, 0);
          rel = `<div class="ctc-event-relative ${isPast ? "overdue" : ""}">${relText}</div>`;
        }
      }
      // Checkbox per cambiare stato del task. Usiamo `summary` come identificatore
      // perché todo.update_item accetta sia uid che summary, ma alcuni backend
      // (es. CalDAV iCloud) non sempre restituiscono uid in get_items.
      // Escape per attributo HTML: virgolette, < e > diventano entità.
      const escAttr = (s) => String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const taskSummary = task.summary || task.name || "Task";
      const checkbox = this._config.allow_complete !== false
        ? `<div class="ctc-task-checkbox ${done ? "checked" : ""}" data-action="toggle-complete" data-entity-id="${task._source}" data-uid="${escAttr(task.uid)}" data-summary="${escAttr(taskSummary)}" data-current-status="${done ? "completed" : "needs_action"}"></div>`
        : "";
      return `<div class="ctc-event-row ctc-item" data-entity-id="${task._source}">${checkbox}<div class="ctc-event-main"><div class="ctc-event-title ${done ? "done" : ""}">${taskSummary}</div>${desc}${rel}${sub}</div><div class="ctc-event-time">${timeStr}</div></div>`;
    };

    // Classifica i task:
    // - attivi con data nel passato → overdueActive (sezione "Scaduti")
    // - attivi con data odierna/futura → mostrati nel ciclo per giorno
    // - attivi senza data → undatedActive (sezione "Senza data")
    // - completati senza data → undatedCompleted (sezione "Completati", se on)
    // - completati con data → allCompletedWithDate (sezione "Completati", se on)
    const todayDateMidnight = new Date();
    todayDateMidnight.setHours(0, 0, 0, 0);
    // Cutoff per scaduti: se overdue_days > 0, mostra solo gli scaduti negli ultimi N giorni
    const overdueDaysCfg = parseInt(this._config.overdue_days);
    const useOverdueFilter = !isNaN(overdueDaysCfg) && overdueDaysCfg > 0;
    const overdueCutoffMs = useOverdueFilter
      ? todayDateMidnight.getTime() - overdueDaysCfg * 86400000
      : -Infinity;
    const undatedActive = [];
    const undatedCompleted = [];
    const allCompletedWithDate = [];
    const overdueActive = [];
    this._tasks.forEach(task => {
      const parsed = parseDueDate(task.due);
      const isCompleted = task.status === "completed";
      if (!parsed) {
        if (isCompleted) undatedCompleted.push(task);
        else undatedActive.push(task);
      } else if (isCompleted) {
        allCompletedWithDate.push(task);
      } else {
        // Attivo con data: scaduto se data < oggi (a mezzanotte)
        const parsedMidnight = new Date(parsed);
        parsedMidnight.setHours(0, 0, 0, 0);
        if (parsedMidnight.getTime() < todayDateMidnight.getTime()) {
          // Applica filtro giorni se configurato
          if (parsedMidnight.getTime() >= overdueCutoffMs) {
            overdueActive.push(task);
          }
        }
        // Se è oggi o nel futuro, lo gestisce il ciclo per giorno sotto
      }
    });

    let hasContent = false;
    let lastWeekShown = null; // per inserire il banner numero settimana ai cambi

    // ── Widget meteo "oggi" in alto (se attivato) ──
    // Recupera l'entità weather configurata e ne legge stato corrente.
    // Mostra: icona meteo, temperatura attuale, condizione (testo localizzato),
    // min/max della giornata e umidità (se disponibili negli attributi).
    const weatherEntity = (this._config.show_weather && this._config.weather_entity && this._hass)
      ? this._hass.states[this._config.weather_entity]
      : null;
    if (this._config.show_weather && this._config.show_weather_today && weatherEntity) {
      const condition = weatherEntity.state; // es. "sunny", "cloudy"
      const icon = getWeatherIcon(condition);
      const label = getWeatherLabel(condition, lang);
      const attrs = weatherEntity.attributes || {};
      const temp = attrs.temperature;
      const unit = attrs.temperature_unit || "°";
      const humidity = attrs.humidity;
      // Cerca min/max nella forecast del giorno corrente
      const todayFc = getForecastForDay(this._weatherForecast, today);
      const tMin = todayFc?.templow != null ? todayFc.templow : null;
      const tMax = todayFc?.temperature != null ? todayFc.temperature : null;
      // Costruisce dettagli: "Min 15° · Max 25° · Umidità 60%"
      const details = [];
      if (tMin != null) details.push(`${t("weather_min", lang)} ${Math.round(tMin)}${unit}`);
      if (tMax != null) details.push(`${t("weather_max", lang)} ${Math.round(tMax)}${unit}`);
      if (humidity != null) details.push(`${t("weather_humidity", lang)} ${Math.round(humidity)}%`);
      const detailsHtml = details.length > 0 ? `<div class="ctc-weather-today-details">${details.join(" · ")}</div>` : "";
      const tempStr = temp != null ? `${Math.round(temp)}${unit}` : "";
      const todayLabel = t("weather_today", lang);
      // IMPORTANTE: il widget meteo "oggi" va FUORI dal body scrollabile, dentro
      // la cardElement (ha-card), così rimane sempre visibile sopra la lista
      // anche quando la scrollbar è attiva. Lo creiamo come elemento DOM e
      // lo inseriamo subito dopo l'header (e prima del body).
      const weatherWidget = document.createElement("div");
      weatherWidget.className = "ctc-weather-today";
      // Quando compact_mode è attivo, aggiungo la classe sul widget per stile compatto
      if (this._config.compact_mode === true) {
        weatherWidget.classList.add("ctc-compact-widget");
      }
      weatherWidget.innerHTML = `
        <ha-icon class="ctc-weather-today-icon" icon="${icon}"></ha-icon>
        <div class="ctc-weather-today-main">
          <div class="ctc-weather-today-temp">
            ${tempStr ? `<span>${tempStr}</span>` : ""}
            <span class="ctc-wt-condition">${todayLabel} ${label.toLowerCase()}</span>
          </div>
          ${detailsHtml}
        </div>`;
      // Inserisco prima del body (che è "card" in questo punto): il body è già
      // stato creato e assegnato a "card", e cardElement è la ha-card vera.
      // Strategia: appendere il widget a cardElement PRIMA che il body venga
      // appeso. Ma in questo flusso il body è già appeso? No: viene appeso
      // alla fine (cardElement.appendChild(card)). Quindi qui appendiamo
      // il widget a cardElement, e DOPO viene aggiunto il body.
      this._cardElement.appendChild(weatherWidget);
    }

    // ── Ciclo per giorno: eventi + task ATTIVI con data ──
    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dk = dayKey(date);
      const dayEvents = this._events.filter(ev => dayKey(new Date(ev.start.dateTime || ev.start.date)) === dk);
      const dayTasks = this._tasks.filter(task => {
        if (task.status === "completed") return false;
        const parsed = parseDueDate(task.due);
        if (!parsed) return false;
        return dayKey(parsed) === dk;
      });
      const totalItems = dayEvents.length + dayTasks.length;
      if (totalItems === 0 && !this._config.show_empty_days) continue;
      hasContent = true;
      const isToday = dk === todayKey;
      const wdRaw = getShortDayName(date, displayLocale);
      const wdName = wdRaw.charAt(0).toUpperCase() + wdRaw.slice(1).toLowerCase();
      const monthName = getShortMonthName(date, displayLocale).toUpperCase();

      // Banner numero settimana: appare ai cambi di settimana, solo se attivo
      if (this._config.show_week_number) {
        const wn = getISOWeekNumber(date);
        if (wn !== lastWeekShown) {
          card.innerHTML += `<div class="ctc-week-banner">${t("week_short", lang)} ${wn}</div>`;
          lastWeekShown = wn;
        }
      }
      // Raggruppa eventi per calendario di origine: una barra unica per gruppo
      const eventGroups = new Map();
      dayEvents.forEach(ev => {
        if (!eventGroups.has(ev._source)) eventGroups.set(ev._source, []);
        eventGroups.get(ev._source).push(ev);
      });
      const eventsHtml = [...eventGroups.entries()].map(([sourceId, group]) => {
        const groupColor = getEntityColor(sourceId, this._config);
        const rowsHtml = group.map(ev => {
          const allDay = isAllDay(ev);
          const s = fmtTimeFormatted(ev.start.dateTime, timeFormat, displayLocale);
          const e = this._config.show_end_time ? fmtTimeFormatted(ev.end?.dateTime, timeFormat, displayLocale) : null;
          const timeStr = allDay ? t("all_day", lang) : (e ? `${s}–${e}` : s);
          const sub = this._config.show_source !== false ? `<div class="ctc-event-sub">${ev._source.replace("calendar.", "")}</div>` : "";
          const descClean = this._config.show_description ? sanitizeDescription(ev.description) : "";
          const desc = descClean ? `<div class="ctc-event-desc">${descClean}</div>` : "";
          // Location (solo se toggle attivo e l'evento ha una location): mostra icona pin + testo
          // Se location_clickable è true, racchiudo in <a> che apre Google Maps in nuova tab.
          // CalDAV iCloud spesso restituisce multi-riga ("Rho\nMI, Italia"), normalizzo con formatLocation.
          let loc = "";
          if (this._config.show_location && ev.location) {
            const locText = formatLocation(ev.location);
            if (locText) {
              const locEscaped = escapeHtmlAttribute(locText);
              const pinIcon = `<ha-icon class="ctc-loc-icon" icon="mdi:map-marker"></ha-icon>`;
              if (this._config.location_clickable) {
                const mapsUrl = buildMapsUrl(locText);
                loc = `<a class="ctc-event-location clickable" href="${mapsUrl}" target="_blank" rel="noopener noreferrer" title="${t("open_in_maps", lang)}: ${locEscaped}" onclick="event.stopPropagation()">${pinIcon}<span>${locEscaped}</span></a>`;
              } else {
                loc = `<div class="ctc-event-location">${pinIcon}<span>${locEscaped}</span></div>`;
              }
            }
          }
          // Tempo relativo "Manca X giorni" (per eventi è solo nel futuro, niente "scaduto")
          let rel = "";
          if (this._config.show_relative_time) {
            const evDate = new Date(ev.start.dateTime || ev.start.date);
            const relText = formatRelativeTime(evDate, undefined, lang);
            if (relText) rel = `<div class="ctc-event-relative">${relText}</div>`;
          }
          return `<div class="ctc-event-row ctc-item" data-entity-id="${ev._source}"><div class="ctc-event-main"><div class="ctc-event-title">${ev.summary || "Evento"}</div>${desc}${loc}${rel}${sub}</div><div class="ctc-event-time">${timeStr}</div></div>`;
        }).join("");
        return `<div class="ctc-event-group"><div class="ctc-bar" style="background:${groupColor}"></div><div class="ctc-event-group-items">${rowsHtml}</div></div>`;
      }).join("");

      // Task attivi del giorno, raggruppati per lista di origine
      const taskGroups = new Map();
      dayTasks.forEach(task => {
        if (!taskGroups.has(task._source)) taskGroups.set(task._source, []);
        taskGroups.get(task._source).push(task);
      });
      const tasksHtml = [...taskGroups.entries()].map(([sourceId, items]) => {
        const groupColor = getEntityColor(sourceId, this._config);
        const rowsHtml = items.map(t => renderTaskRow(t, false)).join("");
        return `<div class="ctc-event-group"><div class="ctc-bar" style="background:${groupColor}"></div><div class="ctc-event-group-items">${rowsHtml}</div></div>`;
      }).join("");

      const emptyHtml = totalItems === 0 ? `<div class="ctc-empty-day">${t("no_events_day", lang)}</div>` : "";

      // Meteo per il giorno (se attivato e c'è una previsione disponibile per quel giorno)
      // Le previsioni HA sono limitate (di solito 5-7 giorni). Per i giorni oltre,
      // semplicemente non mostriamo niente (la riga meteo non appare).
      let weatherDayHtml = "";
      if (this._config.show_weather && this._config.show_weather_per_day && weatherEntity) {
        // Per oggi, uso lo stato corrente (state + temperature attribute)
        // Per i giorni futuri, cerco nella forecast
        let condition = null;
        let temp = null;
        let unit = weatherEntity.attributes?.temperature_unit || "°";
        if (isToday) {
          condition = weatherEntity.state;
          temp = weatherEntity.attributes?.temperature;
        } else {
          const fc = getForecastForDay(this._weatherForecast, date);
          if (fc) {
            condition = fc.condition;
            temp = fc.temperature;
          }
        }
        if (condition) {
          const icon = getWeatherIcon(condition);
          const tempStr = temp != null ? `${Math.round(temp)}${unit}` : "";
          weatherDayHtml = `<div class="ctc-weather-day"><ha-icon class="ctc-weather-day-icon" icon="${icon}"></ha-icon>${tempStr ? `<span>${tempStr}</span>` : ""}</div>`;
        } else {
          // Nessuna previsione disponibile per questo giorno (oltre il range forecast).
          // Mostriamo un'icona "cloud-off" discreta invece di niente, così l'utente
          // capisce che il meteo è attivo ma non c'è dato per quel giorno specifico.
          weatherDayHtml = `<div class="ctc-weather-day ctc-weather-day-empty"><ha-icon class="ctc-weather-day-icon" icon="mdi:cloud-off-outline"></ha-icon></div>`;
        }
      }

      card.innerHTML += `
        <div class="ctc-day-row">
          <div class="ctc-date-col">
            <div class="ctc-date-wd">${wdName}</div>
            <div class="ctc-date-num ${isToday ? "today" : ""}">${date.getDate()}</div>
            <div class="ctc-date-month">${monthName}</div>
            ${weatherDayHtml}
          </div>
          <div class="ctc-events-col">
            ${eventsHtml}${tasksHtml}${emptyHtml}
          </div>
        </div>`;
    }

    // ── Sezione globale: task ATTIVI senza data ──
    // Mostrati PRIMA degli scaduti perché sono task ancora "da fare" senza urgenza
    // temporale, mentre gli scaduti sono in stato critico.
    if (undatedActive.length > 0) {
      hasContent = true;
      const undatedGroups = new Map();
      undatedActive.forEach(task => {
        if (!undatedGroups.has(task._source)) undatedGroups.set(task._source, []);
        undatedGroups.get(task._source).push(task);
      });
      const groupsHtml = [...undatedGroups.entries()].map(([sourceId, items]) => {
        const groupColor = getEntityColor(sourceId, this._config);
        const rowsHtml = items.map(t => renderTaskRow(t, false)).join("");
        return `<div class="ctc-event-group"><div class="ctc-bar" style="background:${groupColor}"></div><div class="ctc-event-group-items">${rowsHtml}</div></div>`;
      }).join("");
      card.innerHTML += `
        <div class="ctc-section">
          <div class="ctc-section-header">${t("no_date", lang)}</div>
          <div class="ctc-section-body">${groupsHtml}</div>
        </div>`;
    }

    // ── Sezione globale: task SCADUTI (data nel passato, attivi) ──
    if (this._config.show_overdue !== false && overdueActive.length > 0) {
      hasContent = true;
      // Ordina per data più vecchia prima (il più scaduto in cima)
      overdueActive.sort((a, b) => parseDueDate(a.due) - parseDueDate(b.due));
      const overdueGroups = new Map();
      overdueActive.forEach(task => {
        if (!overdueGroups.has(task._source)) overdueGroups.set(task._source, []);
        overdueGroups.get(task._source).push(task);
      });
      const groupsHtml = [...overdueGroups.values()].map(items => {
        const rowsHtml = items.map(t => renderTaskRow(t, false)).join("");
        return `<div class="ctc-event-group"><div class="ctc-bar overdue"></div><div class="ctc-event-group-items">${rowsHtml}</div></div>`;
      }).join("");
      card.innerHTML += `
        <div class="ctc-section">
          <div class="ctc-section-header overdue">${t("overdue", lang)}</div>
          <div class="ctc-section-body">${groupsHtml}</div>
        </div>`;
    }

    // ── Sezione globale: COMPLETATI (solo se toggle on) ──
    if (this._config.show_completed) {
      // Filtra i completati a quelli completati negli ultimi N giorni.
      // Usa il campo `completed_at` se presente, altrimenti la due date come fallback.
      // I task senza nessuna delle due date NON vengono filtrati (sempre mostrati).
      const completedDays = parseInt(this._config.completed_days);
      const useCompletedFilter = !isNaN(completedDays) && completedDays > 0;
      const cutoffMs = useCompletedFilter
        ? todayDateMidnight.getTime() - (completedDays - 1) * 86400000
        : 0;
      const isWithinCompletedWindow = (task) => {
        if (!useCompletedFilter) return true;
        // Prova prima completed_at (più preciso, presente su alcune integrazioni)
        const completedAt = task.completed_at ? new Date(task.completed_at) : null;
        const due = parseDueDate(task.due);
        const ref = completedAt && !isNaN(completedAt) ? completedAt : due;
        if (!ref) return true; // Nessuna data → mostra sempre
        return ref.getTime() >= cutoffMs;
      };
      const allCompleted = [...allCompletedWithDate, ...undatedCompleted].filter(isWithinCompletedWindow);
      if (allCompleted.length > 0) {
        hasContent = true;
        // Ordina per data più recente prima (i senza data finiscono in fondo)
        allCompleted.sort((a, b) => {
          const da = parseDueDate(a.due);
          const db = parseDueDate(b.due);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return db - da;
        });
        const completedGroups = new Map();
        allCompleted.forEach(task => {
          if (!completedGroups.has(task._source)) completedGroups.set(task._source, []);
          completedGroups.get(task._source).push(task);
        });
        const groupsHtml = [...completedGroups.entries()].map(([sourceId, items]) => {
          const groupColor = getEntityColor(sourceId, this._config);
          const rowsHtml = items.map(t => renderTaskRow(t, true)).join("");
          return `<div class="ctc-event-group"><div class="ctc-bar" style="background:${groupColor};opacity:0.4"></div><div class="ctc-event-group-items">${rowsHtml}</div></div>`;
        }).join("");
        card.innerHTML += `
          <div class="ctc-section">
            <div class="ctc-section-header">${t("completed", lang)}</div>
            <div class="ctc-section-body">${groupsHtml}</div>
          </div>`;
      }
    }
    if (!hasContent) {
      const noEventsFn = t("no_events", lang);
      const noEventsText = typeof noEventsFn === "function" ? noEventsFn(numDays) : noEventsFn;
      card.innerHTML += `<div class="ctc-empty">${noEventsText}</div>`;
    }
    // Aggiungo il body (con tutto il contenuto accumulato) alla card vera (cardElement)
    // e poi cardElement allo shadow DOM.
    cardElement.appendChild(card);
    shadow.appendChild(cardElement);

    // Logica "Limita eventi visibili": dopo il rendering, se limit_events_visible è true
    // e max_events_visible > 0, calcolo l'altezza dei primi N elementi giorno e applico
    // max-height al body. Il browser mostrerà una scrollbar verticale per il contenuto in eccesso.
    const limitEnabled = this._config.limit_events_visible === true;
    const maxVisible = parseInt(this._config.max_events_visible);
    if (limitEnabled && maxVisible && maxVisible > 0) {
      // Uso setTimeout(50ms) invece di requestAnimationFrame perché in compact mode
      // il browser deve applicare il CSS (padding ridotti, line-height nuovi) PRIMA
      // di poter misurare correttamente l'altezza. Anche il doppio rAF non basta
      // perché alcune proprietà (es. line-height) richiedono più frame per propagarsi.
      // 50ms è impercettibile all'utente ma garantisce misure accurate.
      setTimeout(() => {
        // Cerco tutti gli elementi "giorno" (.ctc-day-row) nel body
        const dayRows = card.querySelectorAll(".ctc-day-row");
        if (dayRows.length > maxVisible) {
          // Calcolo l'altezza dei primi N giorni
          let totalHeight = 0;
          for (let i = 0; i < maxVisible; i++) {
            if (dayRows[i]) {
              // getBoundingClientRect è più preciso di offsetHeight per misure subpixel
              totalHeight += dayRows[i].getBoundingClientRect().height;
            }
          }
          // NO buffer aggiuntivo: con getBoundingClientRect + Math.ceil l'altezza è
          // già precisa al pixel. Aggiungere un buffer fa "sbordare" il primo
          // elemento successivo, mostrandone un pezzetto sotto il limite.
          if (totalHeight > 0) {
            // Math.ceil per evitare tagli da arrotondamenti subpixel
            card.style.maxHeight = Math.ceil(totalHeight) + "px";
            card.style.overflowY = "auto";
          }
        }
      }, 50);
    }

    // Refresh button: ferma propagazione per non triggerare l'azione della card
    const refreshBtn = shadow.getElementById("ctc-refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", (e) => { e.stopPropagation(); this._fetchAll(true); });
      refreshBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      refreshBtn.addEventListener("pointerup", (e) => e.stopPropagation());
    }

    // Pulsante "Comprimi tutto / Espandi tutto" nel banner della prima settimana
    const collapseBtn = shadow.getElementById("ctc-collapse-all");
    if (collapseBtn) {
      collapseBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      collapseBtn.addEventListener("pointerup", (e) => e.stopPropagation());
      collapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const newState = !this._isCollapsed;
        try {
          localStorage.setItem(collapseStorageKey, newState ? "1" : "0");
        } catch (err) { /* ignora */ }
        this._render();
      });
    }

    // ── Checkbox task: toggle completato ──
    if (this._config.allow_complete !== false) {
      shadow.querySelectorAll(".ctc-task-checkbox").forEach(cb => {
        // Ferma propagazione per non triggerare le azioni tap/hold sul singolo evento o sulla card
        cb.addEventListener("pointerdown", (e) => e.stopPropagation());
        cb.addEventListener("pointerup", (e) => e.stopPropagation());
        cb.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (cb.classList.contains("busy")) return;
          await this._toggleTaskComplete(cb);
        });
      });
    }

    // ── Azioni standard HA ──
    // Pulisce listener precedenti se esistono
    if (this._cleanupActions) { this._cleanupActions.forEach(fn => fn()); this._cleanupActions = []; }
    this._cleanupActions = [];

    const cardActions = {
      tap: this._config.tap_action,
      hold: this._config.hold_action,
      double_tap: this._config.double_tap_action,
    };
    const hasCardAction = ["tap", "hold", "double_tap"].some(k => cardActions[k] && cardActions[k].action && cardActions[k].action !== "none");
    if (hasCardAction) {
      // Le azioni vanno sulla ha-card vera, non sul body wrapper interno.
      // Altrimenti cliccando sull'header non parte l'azione (l'header è fuori dal body).
      const target = this._cardElement || card;
      target.classList.add("ctc-clickable");
      const cleanup = attachActionListeners(target, () => cardActions, (kind) => {
        handleHaAction(this, this._hass, cardActions[kind], null);
      });
      this._cleanupActions.push(cleanup);
    }
  }

  static getConfigElement() { return document.createElement("calendar-tasks-card-editor"); }
  static getStubConfig() { return { calendars: [], todos: [] }; }
}

/* ─── Editor ────────────────────────────────────────────────────── */
class CalendarTasksCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
  }

  setConfig(config) {
    // Applica i default alla config "minimal" ricevuta. Senza questo,
    // un toggle che ha default ON apparirebbe OFF nell'editor se non è
    // esplicitato nel YAML.
    const merged = {
      ...DEFAULT_CONFIG,
      calendars: [], todos: [],
      ...JSON.parse(JSON.stringify(config)),
    };
    this._config = merged;
    // Se l'editor è già renderizzato, aggiorna solo i valori
    // senza distruggere e ricreare il DOM (mantiene il focus)
    if (this._rendered) {
      this._syncValues();
    } else {
      // Prima apertura: ripulisci silenziosamente eventuali righe vuote o
      // malformate negli array (YAML scritti a mano, righe "Aggiungi" lasciate
      // a metà in sessioni precedenti). NON filtriamo durante l'editing perché
      // "Aggiungi" crea volutamente righe vuote da compilare.
      if (Array.isArray(this._config.calendars)) {
        this._config.calendars = this._config.calendars.filter(isValidEntityId);
      }
      if (Array.isArray(this._config.todos)) {
        this._config.todos = this._config.todos.filter(isValidEntityId);
      }
      this._render();
      this._rendered = true;
    }
  }

  set hass(hass) {
    this._hass = hass;
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._minimizeConfig(this._config) },
      bubbles: true,
      composed: true,
    }));
  }

  /* Rimuove dalla config tutte le chiavi il cui valore è uguale al default,
     così il YAML salvato contiene solo le scelte esplicite dell'utente.
     Mantiene sempre: type, calendars, todos. Per le azioni (tap/hold/...)
     considera default un oggetto con action="none" o vuoto. */
  _minimizeConfig(config) {
    const result = {};
    // type non è in this._config ma deve restare nel YAML
    if (config.type) result.type = config.type;

    // Liste entità: mantieni sempre, anche se vuote
    result.calendars = Array.isArray(config.calendars) ? config.calendars : [];
    result.todos = Array.isArray(config.todos) ? config.todos : [];

    // Chiavi che hanno un default scalare definito
    const scalarKeys = Object.keys(DEFAULT_CONFIG).filter(k => {
      const v = DEFAULT_CONFIG[k];
      return typeof v !== "object" || v === null;
    });
    for (const key of scalarKeys) {
      if (config[key] !== undefined && config[key] !== DEFAULT_CONFIG[key]) {
        result[key] = config[key];
      }
    }

    // Chiavi azione: tap_action / hold_action / double_tap_action e item_* equivalenti
    const actionKeys = [
      "tap_action", "hold_action", "double_tap_action",
    ];
    for (const key of actionKeys) {
      const a = config[key];
      // Se l'azione è "none" (o non definita) consideriamola uguale al default → omettiamo
      if (a && a.action && a.action !== "none") {
        result[key] = a;
      }
    }

    // entity_colors: includi solo se contiene almeno una entry valida
    if (config.entity_colors && typeof config.entity_colors === "object") {
      const cleaned = {};
      for (const [id, color] of Object.entries(config.entity_colors)) {
        // Mantieni solo se l'entità è ancora nelle liste (evita orfani)
        const isStillUsed = (config.calendars || []).includes(id) || (config.todos || []).includes(id);
        if (isStillUsed && color) cleaned[id] = color;
      }
      if (Object.keys(cleaned).length > 0) {
        result.entity_colors = cleaned;
      }
    }

    return result;
  }

  _syncValues() {
    // Aggiorna solo i campi che non hanno il focus
    const s = this.shadowRoot;
    const titleInp = s.querySelector("#inp-title");
    if (titleInp && titleInp !== document.activeElement) titleInp.value = this._config.title || "";
    const daysInp = s.querySelector("#inp-days");
    if (daysInp && daysInp !== document.activeElement) daysInp.value = this._config.days || 7;
  }

  _getEntities(domain) {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(id => id.startsWith(domain + "."))
      .map(id => ({ id, name: this._hass.states[id]?.attributes?.friendly_name || id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  _makeInput(id, type, value, extraClass, onChange) {
    const inp = document.createElement("input");
    inp.id = id;
    inp.type = type;
    inp.value = value;
    inp.className = `ctc-native-input ${extraClass}`;
    if (type === "number") { inp.min = "1"; inp.max = "30"; }

    // Blocca shortcut HA intercettando in capture sul documento
    blockHAShortcuts(inp);

    inp.addEventListener("change", e => onChange(e.target.value));
    return inp;
  }

  _makeToggle(label, checked, onChange) {
    const row = document.createElement("div");
    row.className = "toggle-row";
    const lbl = document.createElement("label");
    lbl.textContent = label;
    const sw = document.createElement("ha-switch");
    sw.checked = checked;
    sw.addEventListener("change", e => onChange(e.target.checked));
    row.append(lbl, sw);
    return row;
  }

  /* Crea un dropdown select stilizzato. options = [{value, text}, ...] */
  _makeSelect(label, currentValue, options, onChange) {
    const row = document.createElement("div");
    row.className = "field-row";
    const lbl = document.createElement("label");
    lbl.textContent = label;
    const sel = document.createElement("select");
    sel.className = "ctc-native-input wide";
    blockHAShortcuts(sel);
    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.text;
      if (opt.value === currentValue) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => onChange(sel.value));
    row.append(lbl, sel);
    return row;
  }

  /* Crea una sezione collassabile con titolo + chevron animato.
     Restituisce { wrapper, body } — il body è dove l'editor aggiunge i campi.
     Lo stato aperto/chiuso è ricordato in _openSections per non ricreare la
     stessa sezione chiusa quando l'editor viene re-renderizzato. */
  _makeCollapsible(id, title, defaultOpen = false, icon = null) {
    if (!this._openSections) this._openSections = {};
    if (!(id in this._openSections)) this._openSections[id] = defaultOpen;

    const wrapper = document.createElement("div");
    wrapper.className = "collapsible" + (this._openSections[id] ? " open" : "");
    wrapper.dataset.sectionId = id;

    const header = document.createElement("div");
    header.className = "collapsible-header";

    // Container per icona + titolo a sinistra
    const titleWrap = document.createElement("span");
    titleWrap.className = "collapsible-title-wrap";

    if (icon) {
      const iconEl = document.createElement("ha-icon");
      iconEl.setAttribute("icon", icon);
      iconEl.className = "collapsible-icon";
      titleWrap.appendChild(iconEl);
    }

    const titleEl = document.createElement("span");
    titleEl.className = "collapsible-title";
    titleEl.textContent = title;
    titleWrap.appendChild(titleEl);

    const chevron = document.createElement("ha-icon");
    chevron.setAttribute("icon", "mdi:chevron-down");
    chevron.className = "collapsible-chevron";

    header.append(titleWrap, chevron);

    const body = document.createElement("div");
    body.className = "collapsible-body";

    header.addEventListener("click", () => {
      const isOpen = wrapper.classList.toggle("open");
      this._openSections[id] = isOpen;
    });

    wrapper.append(header, body);
    return { wrapper, body };
  }

  /* Editor per una singola azione (tap/hold/double_tap). Mostra il select
     dell'azione e, in base al tipo selezionato, i campi parametri dinamici. */
  _makeActionEditor(label, currentConfig, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "action-editor";

    const lbl = document.createElement("div");
    lbl.className = "action-label";
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const cfg = currentConfig || { action: "none" };

    // Riga 1: select azione
    const row1 = document.createElement("div");
    row1.className = "field-row";
    const selLbl = document.createElement("label");
    selLbl.textContent = "Action";
    const sel = document.createElement("select");
    sel.className = "ctc-native-input wide";
    blockHAShortcuts(sel);
    const options = [
      { value: "none", text: "None" },
      { value: "more-info", text: "More info" },
      { value: "toggle", text: "Toggle" },
      { value: "navigate", text: "Navigate" },
      { value: "url", text: "URL" },
      { value: "call-service", text: "Call service" },
      { value: "assist", text: "Assist" },
    ];
    options.forEach(opt => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.text;
      if (opt.value === cfg.action) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => {
      const newAction = sel.value;
      // Reset solo l'azione, preserva eventuali parametri specifici
      const newCfg = { action: newAction };
      onChange(newCfg);
      renderParams(newCfg);
    });
    row1.append(selLbl, sel);
    wrap.appendChild(row1);

    // Container parametri (dinamico)
    const paramsContainer = document.createElement("div");
    paramsContainer.className = "action-params";
    wrap.appendChild(paramsContainer);

    const renderParams = (c) => {
      paramsContainer.innerHTML = "";
      const a = c.action;

      const addParam = (label, value, key, placeholder) => {
        const row = document.createElement("div");
        row.className = "field-row";
        const l = document.createElement("label");
        l.textContent = label;
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "ctc-native-input wide";
        inp.value = value || "";
        if (placeholder) inp.placeholder = placeholder;
        blockHAShortcuts(inp);
        inp.addEventListener("change", () => {
          const updated = { ...c, [key]: inp.value };
          onChange(updated);
        });
        row.append(l, inp);
        paramsContainer.appendChild(row);
      };

      if (a === "navigate") addParam("Path", c.navigation_path, "navigation_path", "/lovelace/home");
      else if (a === "url") addParam("URL", c.url_path, "url_path", "https://...");
      else if (a === "call-service") {
        addParam("Service", c.service, "service", "domain.service");
        // Per service_data accettiamo JSON
        const row = document.createElement("div");
        row.className = "field-row";
        const l = document.createElement("label");
        l.textContent = "Data (JSON)";
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "ctc-native-input wide";
        inp.value = c.data ? JSON.stringify(c.data) : "";
        inp.placeholder = '{"entity_id": "light.x"}';
        blockHAShortcuts(inp);
        inp.addEventListener("change", () => {
          let parsed = {};
          try { if (inp.value.trim()) parsed = JSON.parse(inp.value); } catch (e) { /* ignora */ }
          const updated = { ...c, data: parsed };
          onChange(updated);
        });
        row.append(l, inp);
        paramsContainer.appendChild(row);
      }
      else if (a === "more-info" || a === "toggle") addParam("Entità (opzionale)", c.entity, "entity", "domain.entity");
    };
    renderParams(cfg);

    return wrap;
  }

  _makeEntityRow(type, entityId, index) {
    const domain = type === "calendar" ? "calendar" : "todo";
    const key = type === "calendar" ? "calendars" : "todos";

    const row = document.createElement("div");
    row.className = "entity-row";

    const wrap = document.createElement("div");
    wrap.className = "entity-wrap";

    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "ctc-native-input";
    inp.style.width = "100%";
    inp.value = entityId;
    inp.placeholder = `${domain}.name`;

    // Blocca shortcut HA
    blockHAShortcuts(inp);

    const dropdown = document.createElement("div");
    dropdown.className = "autocomplete";
    dropdown.style.display = "none";

    const renderDropdown = (filter) => {
      const entities = this._getEntities(domain);
      const filtered = entities.filter(e =>
        e.id.includes(filter.toLowerCase()) || e.name.toLowerCase().includes(filter.toLowerCase())
      ).slice(0, 8);

      if (!filtered.length) { dropdown.style.display = "none"; return; }

      dropdown.innerHTML = "";
      filtered.forEach(({ id, name }) => {
        const item = document.createElement("div");
        item.className = "ac-item";
        item.innerHTML = `<div class="ac-name">${name}</div><div class="ac-id">${id}</div>`;
        item.addEventListener("mousedown", e => {
          e.preventDefault();
          inp.value = id;
          dropdown.style.display = "none";
          const list = [...(this._config[key] || [])];
          list[index] = id;
          this._config[key] = list;
          this._fire();
        });
        dropdown.appendChild(item);
      });
      dropdown.style.display = "block";
    };

    inp.addEventListener("focus", () => renderDropdown(inp.value));
    inp.addEventListener("input", () => renderDropdown(inp.value));
    inp.addEventListener("blur", () => {
      setTimeout(() => { dropdown.style.display = "none"; }, 200);
      const list = [...(this._config[key] || [])];
      list[index] = inp.value;
      this._config[key] = list;
      this._fire();
    });

    wrap.append(inp, dropdown);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = `<ha-icon icon="mdi:close"></ha-icon>`;
    removeBtn.addEventListener("click", () => {
      const list = [...(this._config[key] || [])];
      list.splice(index, 1);
      this._config[key] = list;
      this._fire();
      this._rendered = false;
      this._render();
      this._rendered = true;
    });

    row.append(wrap, removeBtn);

    // ── Cerchietto colorato per scegliere il colore dell'entità ──
    // Creato SEMPRE, anche con entità vuota (apparirà comunque per evitare layout shift).
    // Il colore mostrato viene calcolato dinamicamente: quando entityId è vuoto, mostriamo
    // un colore "ghost" (grigio chiaro) che diventa attivo non appena l'entità viene scelta.
    const colorBtn = document.createElement("button");
    colorBtn.className = "color-swatch";
    colorBtn.title = "Choose color";
    colorBtn.type = "button";

    const palette = document.createElement("div");
    palette.className = "color-palette";
    palette.style.display = "none";

    // Funzione per ricalcolare il colore corrente in base allo stato attuale del config.
    // Chiamata sia al setup iniziale, sia quando l'entità cambia (focus/blur/select).
    const refreshSwatchColor = () => {
      const currentId = this._config[key][index];
      if (!isValidEntityId(currentId)) {
        // Entità non ancora scelta: cerchietto "ghost" semitrasparente
        colorBtn.style.background = "var(--divider-color, #ccc)";
        colorBtn.style.opacity = "0.5";
      } else {
        colorBtn.style.background = getEntityColor(currentId, this._config);
        colorBtn.style.opacity = "1";
      }
    };
    refreshSwatchColor();

    // Aggancia listener sull'input per aggiornare il cerchietto quando l'entità cambia
    inp.addEventListener("blur", () => setTimeout(refreshSwatchColor, 250));

    // Pulsante "Auto" — rimuove l'override esplicito, torna alla rotazione automatica
    const autoBtn = document.createElement("button");
    autoBtn.className = "color-palette-auto";
    autoBtn.type = "button";
    autoBtn.title = "Automatic";
    autoBtn.innerHTML = `<ha-icon icon="mdi:autorenew"></ha-icon>`;
    autoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const currentId = this._config[key][index];
      if (currentId && this._config.entity_colors && this._config.entity_colors[currentId]) {
        const newColors = { ...this._config.entity_colors };
        delete newColors[currentId];
        this._config.entity_colors = newColors;
        this._fire();
        refreshSwatchColor();
      }
      palette.style.display = "none";
    });
    palette.appendChild(autoBtn);

    COLOR_PALETTE.forEach(({ name, value }) => {
      const swatch = document.createElement("button");
      swatch.className = "color-palette-item";
      swatch.style.background = value;
      swatch.title = name;
      swatch.type = "button";
      swatch.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentId = this._config[key][index];
        // Se l'entità non è ancora stata scelta, non salviamo nulla (sarebbe orfano)
        if (!isValidEntityId(currentId)) {
          palette.style.display = "none";
          return;
        }
        const newColors = { ...(this._config.entity_colors || {}) };
        newColors[currentId] = value;
        this._config.entity_colors = newColors;
        this._fire();
        refreshSwatchColor();
        palette.style.display = "none";
      });
      palette.appendChild(swatch);
    });

    colorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Se l'entità non è valida, mostriamo comunque la palette ma il click su un colore
      // non farà nulla (vedi check sopra). Inserisco un piccolo tooltip visivo:
      palette.style.display = palette.style.display === "none" ? "grid" : "none";
    });

    // Chiudi la palette quando clicchi fuori
    const closeOnOutside = (e) => {
      if (!row.contains(e.target)) palette.style.display = "none";
    };
    document.addEventListener("click", closeOnOutside);
    row._cleanup = () => document.removeEventListener("click", closeOnOutside);

    const colorWrap = document.createElement("div");
    colorWrap.className = "color-wrap";
    colorWrap.append(colorBtn, palette);
    row.insertBefore(colorWrap, wrap);

    return row;
  }

  _render() {
    const shadow = this.shadowRoot;
    shadow.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = EDITOR_STYLES;
    shadow.appendChild(style);

    const root = document.createElement("div");
    root.className = "editor";

    // ── Entities (Calendars + Todo lists) ──
    // Open by default only on the very first installation (no entities configured yet)
    // so the user knows immediately where to add them.
    {
      const hasNoEntities = (this._config.calendars || []).length === 0
        && (this._config.todos || []).length === 0;
      const { wrapper, body } = this._makeCollapsible("entities", "Entities", hasNoEntities, "mdi:format-list-bulleted");

      // Sub-section: Calendars
      {
        const sub = this._makeCollapsible("entities-cal", "Calendars");
        const calList = document.createElement("div");
        calList.className = "entity-list";
        (this._config.calendars || []).forEach((id, i) => calList.appendChild(this._makeEntityRow("calendar", id, i)));
        sub.body.appendChild(calList);
        const addCal = document.createElement("button");
        addCal.className = "add-btn";
        addCal.innerHTML = `<ha-icon icon="mdi:plus"></ha-icon> Add calendar`;
        addCal.addEventListener("click", () => {
          this._config.calendars = [...(this._config.calendars || []), ""];
          this._fire();
          this._rendered = false;
          this._render();
          this._rendered = true;
        });
        sub.body.appendChild(addCal);
        sub.wrapper.classList.add("nested");
        body.appendChild(sub.wrapper);
      }

      // Sub-section: Todo lists
      {
        const sub = this._makeCollapsible("entities-todo", "Todo lists");
        const todoList = document.createElement("div");
        todoList.className = "entity-list";
        (this._config.todos || []).forEach((id, i) => todoList.appendChild(this._makeEntityRow("todo", id, i)));
        sub.body.appendChild(todoList);
        const addTodo = document.createElement("button");
        addTodo.className = "add-btn";
        addTodo.innerHTML = `<ha-icon icon="mdi:plus"></ha-icon> Add todo list`;
        addTodo.addEventListener("click", () => {
          this._config.todos = [...(this._config.todos || []), ""];
          this._fire();
          this._rendered = false;
          this._render();
          this._rendered = true;
        });
        sub.body.appendChild(addTodo);
        sub.wrapper.classList.add("nested");
        body.appendChild(sub.wrapper);
      }

      root.appendChild(wrapper);
    }

    // ── General ──
    {
      const { wrapper, body } = this._makeCollapsible("gen", "General", false, "mdi:tune");

      body.appendChild(this._makeToggle("Show title", this._config.show_title !== false,
        v => { this._config.show_title = v; this._fire(); }));

      const rowTitle = document.createElement("div");
      rowTitle.className = "field-row";
      const lblTitle = document.createElement("label");
      lblTitle.textContent = "Title";
      const inpTitle = this._makeInput("inp-title", "text", this._config.title || "Agenda", "wide",
        v => { this._config.title = v; this._fire(); });
      rowTitle.append(lblTitle, inpTitle);
      body.appendChild(rowTitle);

      const rowDays = document.createElement("div");
      rowDays.className = "field-row";
      const lblDays = document.createElement("label");
      lblDays.textContent = "Days to show";
      const inpDays = this._makeInput("inp-days", "number", this._config.days || 7, "narrow",
        v => { this._config.days = parseInt(v) || 7; this._fire(); });
      rowDays.append(lblDays, inpDays);
      body.appendChild(rowDays);

      body.appendChild(this._makeToggle("Show refresh button", this._config.show_refresh !== false,
        v => { this._config.show_refresh = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show collapse button", this._config.show_collapse_button !== false,
        v => { this._config.show_collapse_button = v; this._fire(); }));

      // ── Limit events visible: toggle + numero condizionale ──
      const limitEnabled = this._config.limit_events_visible === true;

      // Creo PRIMA la riga del numero (perché il toggle deve poterla mostrare/nascondere)
      const rowMaxEv = document.createElement("div");
      rowMaxEv.className = "field-row";
      rowMaxEv.style.display = limitEnabled ? "" : "none";
      rowMaxEv.style.paddingLeft = "16px";  // indentazione visiva
      const lblMaxEv = document.createElement("label");
      lblMaxEv.textContent = "Max events visible";
      const inpMaxEv = this._makeInput("inp-maxev", "number",
        this._config.max_events_visible != null ? this._config.max_events_visible : 3, "narrow",
        v => {
          const n = parseInt(v);
          this._config.max_events_visible = isNaN(n) || n < 1 ? 1 : n;
          this._fire();
        });
      rowMaxEv.append(lblMaxEv, inpMaxEv);

      // Poi creo il toggle, che ora può riferirsi a rowMaxEv
      body.appendChild(this._makeToggle("Limit visible events (enable scrollbar)", limitEnabled,
        v => {
          this._config.limit_events_visible = v;
          rowMaxEv.style.display = v ? "" : "none";
          this._fire();
        }));

      // Aggiungo la riga del numero al body (sotto al toggle)
      body.appendChild(rowMaxEv);

      // Compact mode: riduce spazi verticali per card più compatta
      body.appendChild(this._makeToggle("Compact mode (reduced spacing)", this._config.compact_mode === true,
        v => { this._config.compact_mode = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Localization ──
    {
      const { wrapper, body } = this._makeCollapsible("loc", "Localization", false, "mdi:translate");

      body.appendChild(this._makeSelect("Language",
        this._config.language || "auto",
        [
          { value: "auto", text: "System default" },
          { value: "it", text: "Italiano" },
          { value: "en", text: "English" },
        ],
        v => { this._config.language = v; this._fire(); }));

      body.appendChild(this._makeSelect("Time format",
        this._config.time_format || "auto",
        [
          { value: "auto", text: "System default" },
          { value: "24h", text: "24 hours (13:30)" },
          { value: "12h", text: "12 hours (1:30 PM)" },
        ],
        v => { this._config.time_format = v; this._fire(); }));

      body.appendChild(this._makeSelect("First day of the week",
        this._config.first_day_of_week || "auto",
        [
          { value: "auto", text: "System default" },
          { value: "monday", text: "Monday" },
          { value: "sunday", text: "Sunday" },
          { value: "saturday", text: "Saturday" },
        ],
        v => { this._config.first_day_of_week = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Display ──
    {
      const { wrapper, body } = this._makeCollapsible("display", "Display", false, "mdi:eye");

      body.appendChild(this._makeToggle("Show week number", !!this._config.show_week_number,
        v => { this._config.show_week_number = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show end time", !!this._config.show_end_time,
        v => { this._config.show_end_time = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show empty days", !!this._config.show_empty_days,
        v => { this._config.show_empty_days = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show relative time (in X days)", this._config.show_relative_time !== false,
        v => { this._config.show_relative_time = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show source (calendar/list)", !!this._config.show_source,
        v => { this._config.show_source = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show description", this._config.show_description !== false,
        v => { this._config.show_description = v; this._fire(); }));
      body.appendChild(this._makeToggle("Show location (calendar events)", !!this._config.show_location,
        v => { this._config.show_location = v; this._fire(); }));
      body.appendChild(this._makeToggle("Make location clickable (opens maps)", !!this._config.location_clickable,
        v => { this._config.location_clickable = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Weather ──
    {
      const { wrapper, body } = this._makeCollapsible("weather", "Weather", false, "mdi:weather-partly-cloudy");

      // Master toggle: attiva/disattiva l'intera funzionalità meteo
      const showWeather = this._config.show_weather === true;

      // Container per i campi che appaiono solo se il toggle master è ON
      const subFields = document.createElement("div");
      subFields.style.display = showWeather ? "" : "none";
      subFields.style.paddingLeft = "16px";

      // Campo: weather entity (con autocompletamento delle entità weather.*)
      // Uso lo stesso pattern dei calendari/todo: input testuale con dropdown
      const rowEntity = document.createElement("div");
      rowEntity.className = "field-row";
      const lblEntity = document.createElement("label");
      lblEntity.textContent = "Weather entity";

      const entityWrap = document.createElement("div");
      entityWrap.style.position = "relative";
      entityWrap.style.flex = "1";
      entityWrap.style.maxWidth = "200px";

      const inpEntity = document.createElement("input");
      inpEntity.type = "text";
      inpEntity.className = "ctc-native-input";
      inpEntity.style.width = "100%";
      inpEntity.value = this._config.weather_entity || "";
      inpEntity.placeholder = "weather.home";
      blockHAShortcuts(inpEntity);

      const dropdownEntity = document.createElement("div");
      dropdownEntity.className = "autocomplete";
      dropdownEntity.style.display = "none";

      const renderDropdownWeather = (filter) => {
        const entities = this._getEntities("weather");
        const filtered = entities.filter(e =>
          e.id.includes(filter.toLowerCase()) || e.name.toLowerCase().includes(filter.toLowerCase())
        ).slice(0, 8);
        if (!filtered.length) { dropdownEntity.style.display = "none"; return; }
        dropdownEntity.innerHTML = "";
        filtered.forEach(({ id, name }) => {
          const item = document.createElement("div");
          item.className = "ac-item";
          item.innerHTML = `<div class="ac-name">${name}</div><div class="ac-id">${id}</div>`;
          item.addEventListener("mousedown", e => {
            e.preventDefault();
            inpEntity.value = id;
            dropdownEntity.style.display = "none";
            this._config.weather_entity = id;
            this._fire();
          });
          dropdownEntity.appendChild(item);
        });
        dropdownEntity.style.display = "block";
      };
      inpEntity.addEventListener("focus", () => renderDropdownWeather(inpEntity.value));
      inpEntity.addEventListener("input", () => renderDropdownWeather(inpEntity.value));
      inpEntity.addEventListener("blur", () => {
        setTimeout(() => { dropdownEntity.style.display = "none"; }, 200);
        this._config.weather_entity = inpEntity.value;
        this._fire();
      });
      entityWrap.append(inpEntity, dropdownEntity);
      rowEntity.append(lblEntity, entityWrap);
      subFields.appendChild(rowEntity);

      // Toggle: mostra meteo "oggi" in alto
      subFields.appendChild(this._makeToggle("Show today's weather (top widget)",
        this._config.show_weather_today !== false,
        v => { this._config.show_weather_today = v; this._fire(); }));

      // Toggle: mostra meteo per ogni giorno (sotto la data)
      subFields.appendChild(this._makeToggle("Show weather per day (next to date)",
        this._config.show_weather_per_day === true,
        v => { this._config.show_weather_per_day = v; this._fire(); }));

      // Master toggle (in cima alla sezione)
      body.appendChild(this._makeToggle("Show weather", showWeather,
        v => {
          this._config.show_weather = v;
          subFields.style.display = v ? "" : "none";
          this._fire();
        }));

      body.appendChild(subFields);

      root.appendChild(wrapper);
    }

    // ── Tasks ──
    {
      const { wrapper, body } = this._makeCollapsible("tasks", "Tasks", false, "mdi:checkbox-marked-circle-outline");

      body.appendChild(this._makeToggle("Show overdue tasks", this._config.show_overdue !== false,
        v => { this._config.show_overdue = v; this._fire(); }));

      const rowOverdueDays = document.createElement("div");
      rowOverdueDays.className = "field-row";
      const lblOverdueDays = document.createElement("label");
      lblOverdueDays.textContent = "Overdue days to show (0 = all)";
      const inpOverdueDays = this._makeInput("inp-overdue-days", "number", this._config.overdue_days != null ? this._config.overdue_days : 0, "narrow",
        v => {
          const n = parseInt(v);
          this._config.overdue_days = isNaN(n) || n < 0 ? 0 : n;
          this._fire();
        });
      rowOverdueDays.append(lblOverdueDays, inpOverdueDays);
      body.appendChild(rowOverdueDays);

      body.appendChild(this._makeToggle("Show completed tasks", this._config.show_completed !== false,
        v => { this._config.show_completed = v; this._fire(); }));

      const rowCompletedDays = document.createElement("div");
      rowCompletedDays.className = "field-row";
      const lblCompletedDays = document.createElement("label");
      lblCompletedDays.textContent = "Completed days to show";
      const inpCompletedDays = this._makeInput("inp-completed-days", "number", this._config.completed_days != null ? this._config.completed_days : 7, "narrow",
        v => {
          const n = parseInt(v);
          this._config.completed_days = isNaN(n) || n < 0 ? 7 : n;
          this._fire();
        });
      rowCompletedDays.append(lblCompletedDays, inpCompletedDays);
      body.appendChild(rowCompletedDays);

      body.appendChild(this._makeToggle("Allow completing tasks", this._config.allow_complete !== false,
        v => { this._config.allow_complete = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Interactions ──
    {
      const { wrapper, body } = this._makeCollapsible("inter", "Interactions", false, "mdi:gesture-tap");
      body.classList.add("inter-compact");
      body.appendChild(this._makeActionEditor("Tap",
        this._config.tap_action,
        cfg => { this._config.tap_action = cfg; this._fire(); }));
      body.appendChild(this._makeActionEditor("Hold",
        this._config.hold_action,
        cfg => { this._config.hold_action = cfg; this._fire(); }));
      body.appendChild(this._makeActionEditor("Double tap",
        this._config.double_tap_action,
        cfg => { this._config.double_tap_action = cfg; this._fire(); }));
      root.appendChild(wrapper);
    }

    shadow.appendChild(root);
  }
}

/* ─── Registrazione ─────────────────────────────────────────────── */
customElements.define("calendar-tasks-card", CalendarTasksCard);
customElements.define("calendar-tasks-card-editor", CalendarTasksCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ type: "calendar-tasks-card", name: "Calendar & Tasks Card", description: "Shows calendar events and todo tasks in a unified agenda view", preview: true });

console.info(`%c CALENDAR-TASKS-CARD %c v${CARD_VERSION} `, "background:#4285f4;color:#fff;border-radius:3px 0 0 3px;padding:2px 6px;font-weight:bold", "background:#34a853;color:#fff;border-radius:0 3px 3px 0;padding:2px 6px");
