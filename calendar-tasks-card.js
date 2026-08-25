/**
 * calendar-tasks-card v1.9.1
 */

const CARD_VERSION = "1.9.1";

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
  show_current_date: false,
  show_view_switch: false,        // mostra un pulsante nell'header per alternare agenda ↔ vista mese
  show_refresh: true,
  show_add_event: false,          // mostra un pulsante nell'header che apre il dialog nativo di HA per creare un evento
  days: 7,
  show_end_time: false,
  show_empty_days: false,
  show_source: false,
  show_description: true,
  show_location: false,
  location_clickable: false,
  show_completed: true,
  completed_days: 7,
  show_no_date: true,
  show_overdue: true,
  overdue_days: 0,
  allow_complete: false,
  show_relative_time: true,
  show_week_number: false,
  show_collapse_button: true,
  time_format: "auto",      // "auto" (segue locale), "12h", "24h"
  first_day_of_week: "auto", // "auto" (segue locale), "monday", "sunday", "saturday"
  month_view: false,        // false = vista agenda (lista), true = vista griglia mensile
  language: "auto",         // "auto" (locale del browser/HA), "en" (inglese), "it" (italiano)
  refresh_interval: 300,
  limit_events_visible: false,    // se true, attiva la scrollbar e mostra solo max_events_visible giorni
  max_events_visible: 3,          // numero di giorni da mostrare quando limit_events_visible è true
  compact_mode: false,            // se true, riduce spazi verticali per card più compatta
  show_weather: false,            // master toggle per le funzionalità meteo
  weather_entity: "",             // entità weather di HA da usare (es. weather.home)
  show_weather_today: true,       // mostra widget meteo dettagliato in alto (solo oggi)
  show_weather_per_day: false,    // mostra meteo (icona + temp) sotto la data di ogni giorno
  multi_day_events: true,         // mostra gli eventi multi-giorno in tutti i giorni che coprono
  // Sfondo: 'transparent' rimuove sfondo, ombra e bordo (la card si fonde con la
  // dashboard). 'background_image' imposta un'immagine (URL o percorso /local/...).
  // Con l'immagine, un velo regolabile preserva la leggibilità del testo.
  // Stessi nomi di opzione della sun-weather-card, per coerenza tra le due card.
  transparent: false,
  background_image: null,
  // velo sopra l'immagine: valore unico da -1 a +1
  //  -1 = chiaro pieno, 0 = nessun velo, +1 = scuro pieno
  background_overlay: 0,
  exclude: [],                    // lista di keyword: gli eventi/task con titolo che le contiene vengono nascosti
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

  /* ─── Sfondo trasparente: via sfondo, ombra e bordo ─── */
  ha-card.ctc-transparent {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    border: none !important;
    /* i temi "glass" (es. Frosted Glass) usano backdrop-filter e variabili proprie */
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    --ha-card-background: transparent;
    --ha-card-box-shadow: none;
    --ha-card-border-width: 0;
    --ha-card-backdrop-filter: none;
    --card-background-color: transparent;
  }
  /* i temi "glass" disegnano spesso il vetro con uno pseudo-elemento sopra la
     card: va neutralizzato anche quello, altrimenti resta visibile */
  ha-card.ctc-transparent::before,
  ha-card.ctc-transparent::after {
    content: none !important;
    display: none !important;
    background: none !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
  }

  /* ─── Immagine di sfondo ─── */
  /* Dipinta sulla card stessa (nessun wrapper, che spunterebbe agli angoli).
     Il velo è incorporato nel background come primo layer del gradiente. */
  ha-card.ctc-has-bg-image {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: none !important;
    --ha-card-border-width: 0;
    overflow: hidden;
  }
  /* La fascia grigia del widget meteo e i separatori stonano sopra
     un'immagine: li rendiamo trasparenti e più discreti. */
  ha-card.ctc-has-bg-image .ctc-weather-today,
  ha-card.ctc-transparent .ctc-weather-today {
    background: transparent !important;
  }
  ha-card.ctc-has-bg-image .ctc-day-row + .ctc-day-row {
    border-top-color: rgba(128, 128, 128, 0.35);
  }
  /* Su velo scuro schiarisce i testi, che di default seguono il tema chiaro */
  ha-card.ctc-bg-dark .ctc-title,
  ha-card.ctc-bg-dark .ctc-date-wd,
  ha-card.ctc-bg-dark .ctc-date-num,
  ha-card.ctc-bg-dark .ctc-date-month,
  ha-card.ctc-bg-dark .ctc-event-title,
  ha-card.ctc-bg-dark .ctc-event-time,
  ha-card.ctc-bg-dark .ctc-event-relative,
  ha-card.ctc-bg-dark .ctc-event-desc,
  ha-card.ctc-bg-dark .ctc-event-location,
  ha-card.ctc-bg-dark .ctc-section-title,
  ha-card.ctc-bg-dark .ctc-empty,
  ha-card.ctc-bg-dark .ctc-empty-day,
  ha-card.ctc-bg-dark .ctc-week-banner,
  ha-card.ctc-bg-dark .ctc-day-counter,
  ha-card.ctc-bg-dark .ctc-weather-day,
  ha-card.ctc-bg-dark .ctc-weather-today-temp,
  ha-card.ctc-bg-dark .ctc-weather-today-details,
  ha-card.ctc-bg-dark .ctc-wt-condition {
    color: #f3f3f3;
  }
  ha-card.ctc-bg-dark .ctc-weather-today-icon,
  ha-card.ctc-bg-dark .ctc-weather-day-icon,
  ha-card.ctc-bg-dark .ctc-header ha-icon {
    color: #f3f3f3;
  }

  .ctc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--ctc-border);
    gap: 8px;
    min-height: 36px;
  }
  .ctc-title-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }
  .ctc-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--ctc-text);
    letter-spacing: 0.02em;
    min-width: 0;
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .ctc-current-date {
    font-size: 12px;
    font-weight: 400;
    color: var(--ctc-hint);
    line-height: 1.1;
    letter-spacing: 0.01em;
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
  /* Contatore "(2/6)" per eventi multi-giorno: discreto, accanto al titolo */
  .ctc-day-counter {
    margin-left: 6px;
    font-size: 0.85em;
    font-weight: 400;
    color: var(--ctc-muted);
  }
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

  /* Modalità compatta anche per la griglia mensile: celle più basse,
     numeri e intestazioni più piccoli, meno spazi attorno alla griglia */
  .ctc-compact .ctc-month { padding: 4px 8px 8px; }
  .ctc-compact .ctc-month-header { margin-bottom: 6px; }
  .ctc-compact .ctc-month-label { font-size: 14px; }
  .ctc-compact .ctc-month-dow-cell { font-size: 10px; padding: 2px 0; }
  .ctc-compact .ctc-month-grid { gap: 1px; }
  .ctc-compact .ctc-month-cell { padding-top: 2px; border-radius: 6px; aspect-ratio: auto; min-height: 34px; }
  .ctc-compact .ctc-month-num { font-size: 12px; width: 20px; height: 20px; }
  .ctc-compact .ctc-month-wk-cell { line-height: 20px; }
  .ctc-compact .ctc-month-dot { width: 4px; height: 4px; margin-top: 2px; }

  /* ─── Vista griglia mensile ─── */
  .ctc-month {
    padding: 8px 12px 14px;
  }
  .ctc-month-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .ctc-month-label {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text-color);
    text-align: center;
    flex: 1;
  }
  .ctc-month-label-active {
    cursor: pointer;
  }
  .ctc-month-label-active:hover {
    color: var(--primary-color, #03a9f4);
  }
  .ctc-month-nav {
    background: transparent;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: 22px;
  }
  .ctc-month-nav:hover {
    background: var(--secondary-background-color, rgba(128,128,128,0.12));
    color: var(--primary-text-color);
  }
  .ctc-month-dow {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 4px;
  }
  /* Con la colonna numero settimana: prima colonna stretta + 7 colonne giorni */
  .ctc-month-dow.ctc-month-hasweek,
  .ctc-month-grid.ctc-month-hasweek {
    grid-template-columns: 22px repeat(7, 1fr);
  }
  .ctc-month-wk-cell {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 4px;
    font-size: 10px;
    font-weight: 600;
    line-height: 24px;
    color: var(--ctc-hint, var(--disabled-text-color));
    opacity: 0.7;
  }
  .ctc-month-dow-cell {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--secondary-text-color);
    padding: 4px 0;
  }
  .ctc-month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .ctc-month-cell {
    position: relative;
    aspect-ratio: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    border-radius: 8px;
    padding-top: 4px;
    box-sizing: border-box;
  }
  /* Pallino neutro: giorno con almeno un evento o task */
  .ctc-month-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--primary-color, #03a9f4);
    margin-top: 3px;
  }
  .ctc-month-clickable { cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .ctc-month-clickable:hover { background: var(--secondary-background-color, rgba(128,128,128,0.12)); }
  .ctc-month-num {
    font-size: 13px;
    color: var(--primary-text-color);
    line-height: 1;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  /* Giorni del mese precedente/successivo che riempiono la griglia: attenuati */
  .ctc-month-other .ctc-month-num {
    color: var(--ctc-hint, var(--disabled-text-color));
    opacity: 0.5;
  }
  /* Oggi: cerchietto pieno col colore primario del tema.
     Stessa box 24px degli altri numeri: cambia solo lo sfondo, così resta
     allineato verticalmente e non "scende". */
  .ctc-month-today .ctc-month-num {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    border-radius: 50%;
    font-weight: 600;
  }

`;

/* ─── Stili del form Aggiungi (usati sia in shadow DOM sia iniettati nel body) ─── */
const ADD_FORM_STYLES = `
  /* ─── Form "Aggiungi evento/task" (overlay dentro la card) ─── */
  .ctc-add-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    padding: 16px;
    box-sizing: border-box;
  }
  .ctc-add-panel {
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    width: 100%;
    max-width: 340px;
    /* vh come fallback per browser meno recenti; dvh (altezza dinamica del
       viewport) corregge il calcolo su mobile quando la barra degli indirizzi
       si nasconde/mostra — evita che il pannello risulti più alto dello
       schermo realmente visibile senza modo di scrollare fino in fondo. */
    max-height: calc(100vh - 32px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 16px;
    box-sizing: border-box;
  }
  .ctc-add-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .ctc-add-typetoggle {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
  }
  .ctc-add-typebtn {
    flex: 1;
    padding: 7px 10px;
    border: 1px solid var(--divider-color, #ccc);
    background: transparent;
    color: var(--primary-text-color);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
  }
  .ctc-add-typebtn.active {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color, #03a9f4);
  }
  .ctc-add-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }
  .ctc-add-field label {
    font-size: 13px;
    color: var(--secondary-text-color);
  }
  .ctc-add-field.ctc-add-inline {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .ctc-add-field.ctc-add-inline label { order: 2; }
  .ctc-add-check { width: 18px; height: 18px; }
  .ctc-add-fields .ctc-native-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 8px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 14px;
  }
  .ctc-add-textarea {
    resize: vertical;
    font-family: inherit;
    min-height: 38px;
  }
  .ctc-add-error {
    color: var(--error-color, #db4437);
    font-size: 13px;
    margin-top: 4px;
  }
  .ctc-add-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
  }
  .ctc-add-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }
  .ctc-add-cancel {
    background: transparent;
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color, #ccc);
  }
  .ctc-add-save {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }
  .ctc-add-save:disabled { opacity: 0.6; cursor: default; }

  /* Selettore mese/anno: "Oggi" a sinistra, Annulla/Vai a destra */
  .ctc-month-picker-actions { justify-content: space-between; }

  /* Selettore a griglia: barra anno + 12 mesi */
  .ctc-ypick-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 4px 0 10px;
  }
  .ctc-ypick-year {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-text-color);
    flex: 1;
    text-align: center;
  }
  .ctc-ypick-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 6px;
  }
  .ctc-ypick-month {
    padding: 10px 4px;
    border: 1px solid var(--divider-color, #ccc);
    background: transparent;
    color: var(--primary-text-color);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
  }
  .ctc-ypick-month:hover {
    background: var(--secondary-background-color, rgba(128,128,128,0.12));
  }
  /* Mese attualmente visualizzato nella card: bordo evidenziato */
  .ctc-ypick-current {
    border-color: var(--primary-color, #03a9f4);
    color: var(--primary-color, #03a9f4);
    font-weight: 600;
  }
  /* Mese reale di oggi: riempito */
  .ctc-ypick-today {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color, #03a9f4);
  }
  .ctc-ypick-today:hover {
    background: var(--primary-color, #03a9f4);
    opacity: 0.9;
  }

  /* ─── Popup del giorno (vista griglia) ─── */
  .ctc-day-list {
    margin: 4px 0 8px;
    max-height: 50vh;
    overflow-y: auto;
  }
  .ctc-day-empty {
    color: var(--secondary-text-color);
    font-size: 14px;
    padding: 12px 2px;
    text-align: center;
  }
  .ctc-day-row {
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding: 7px 0;
    border-bottom: 1px solid var(--divider-color, rgba(128,128,128,0.2));
  }
  .ctc-day-row:last-child { border-bottom: none; }
  .ctc-day-bar {
    flex: 0 0 4px;
    width: 4px;
    border-radius: 2px;
    background: var(--primary-color);
  }
  .ctc-day-row-main {
    flex: 1;
    min-width: 0;
  }
  .ctc-day-row-title {
    font-size: 14px;
    color: var(--primary-text-color);
    word-break: break-word;
  }
  .ctc-day-row-time {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 1px;
  }
  .ctc-day-row-loc {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .ctc-day-row-loc-link {
    color: var(--primary-color, #03a9f4);
    text-decoration: none;
  }
  .ctc-day-row-loc-link:hover { text-decoration: underline; }
  .ctc-day-row-rel {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 1px;
    font-style: italic;
  }
  .ctc-day-row-loc .ctc-loc-icon {
    --mdc-icon-size: 14px;
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
  }
  .ctc-day-row-desc {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 2px;
    word-break: break-word;
  }
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
  /* Variante impilata: etichetta sopra e campo a tutta larghezza. Serve per i
     valori lunghi (es. percorsi immagine) che nei 160px dei campi affiancati
     risulterebbero illeggibili. */
  .field-row.stacked { flex-direction: column; align-items: stretch; gap: 4px; }
  .field-row.stacked label { flex: none; }
  .field-row.stacked .ctc-native-input { width: 100%; box-sizing: border-box; }
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

  /* Slider del velo sfondo: barra con gradiente bianco→nero che mostra
     visivamente cosa fa il cursore (a sinistra schiarisce, a destra scurisce) */
  input[type="range"].ctc-overlay-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 999px;
    padding: 0;
    margin: 0;
    border: 1px solid var(--divider-color, #ccc);
    background: linear-gradient(to right, #ffffff, #d9d9d9 50%, #000000);
    cursor: pointer;
  }
  input[type="range"].ctc-overlay-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color, #03a9f4);
    border: 2px solid #fff;
    box-shadow: 0 0 2px rgba(0,0,0,0.4);
  }
  input[type="range"].ctc-overlay-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color, #03a9f4);
    border: 2px solid #fff;
  }
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
  de: {
    "clear-night": "Klar",
    "cloudy": "Bewölkt",
    "exceptional": "Außergewöhnlich",
    "fog": "Nebel",
    "hail": "Hagel",
    "lightning": "Gewitter",
    "lightning-rainy": "Gewitter und Regen",
    "partlycloudy": "Teilweise bewölkt",
    "pouring": "Starkregen",
    "rainy": "Regnerisch",
    "snowy": "Schnee",
    "snowy-rainy": "Schnee und Regen",
    "sunny": "Sonnig",
    "windy": "Windig",
    "windy-variant": "Windig",
  },
  fr: {
    "clear-night": "Nuit claire",
    "cloudy": "Nuageux",
    "exceptional": "Exceptionnel",
    "fog": "Brouillard",
    "hail": "Grêle",
    "lightning": "Orage",
    "lightning-rainy": "Orage et pluie",
    "partlycloudy": "Partiellement nuageux",
    "pouring": "Pluie forte",
    "rainy": "Pluvieux",
    "snowy": "Neigeux",
    "snowy-rainy": "Neige et pluie mêlées",
    "sunny": "Ensoleillé",
    "windy": "Venteux",
    "windy-variant": "Venteux et nuageux",
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

/* ─── Helper filtro exclude ─────────────────────────────────────── */
/* Controlla se un titolo contiene una delle keyword di exclude.
   Match parziale (sub-string) e case-insensitive: "lavoro" matcha "Riunione di lavoro".
   Accetta sia stringhe che array; ritorna true se il titolo va NASCOSTO.
   Le keyword vuote vengono ignorate (per non nascondere accidentalmente tutto). */
/* ─── Helper eventi multi-giorno ────────────────────────────────── */
/* Calcola l'intervallo di giorni coperto da un evento.
   Ritorna { start, end, totalDays } con start/end normalizzati a mezzanotte.

   ATTENZIONE al formato di `end`, che differisce tra i due tipi di evento:
   - Eventi ALL-DAY: HA/Google usano `end.date` ESCLUSIVO. Un evento che dura
     il 10 e l'11 ha end.date = "2026-06-12". Va sottratto un giorno.
   - Eventi CON ORARIO: `end.dateTime` è inclusivo (è il momento in cui finisce),
     quindi il giorno di fine è semplicemente la sua data.
   Senza questa distinzione un evento all-day di 1 giorno risulterebbe di 2. */
function getEventDayRange(ev) {
  const isAllDay = !!(ev.start && ev.start.date && !ev.start.dateTime);
  const startRaw = ev.start?.dateTime || ev.start?.date;
  const endRaw = ev.end?.dateTime || ev.end?.date;
  // parseEventDate interpreta le date-only in orario locale (non UTC), evitando
  // lo slittamento di un giorno nei fusi a ovest di UTC.
  const start = parseEventDate(startRaw);
  if (!start || isNaN(start)) return null;
  start.setHours(0, 0, 0, 0);

  // Se manca `end` (alcune integrazioni non lo espongono), l'evento dura 1 giorno
  if (!endRaw) return { start, end: start, totalDays: 1 };

  const end = parseEventDate(endRaw);
  if (!end || isNaN(end)) return { start, end: start, totalDays: 1 };
  end.setHours(0, 0, 0, 0);
  if (isAllDay) end.setDate(end.getDate() - 1);  // end esclusivo → ultimo giorno reale

  // Un end precedente allo start (dati incoerenti) viene trattato come 1 giorno
  if (end < start) return { start, end: start, totalDays: 1 };

  const totalDays = Math.round((end - start) / 86400000) + 1;
  return { start, end, totalDays };
}

/* Dice se una data cade nell'intervallo coperto dall'evento e, in caso
   affermativo, a quale giorno dell'evento corrisponde (1-based).
   Ritorna { inRange, dayIndex, totalDays }. */
function getEventDayPosition(ev, date) {
  const range = getEventDayRange(ev);
  if (!range) return { inRange: false, dayIndex: 0, totalDays: 0 };
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d < range.start || d > range.end) {
    return { inRange: false, dayIndex: 0, totalDays: range.totalDays };
  }
  const dayIndex = Math.round((d - range.start) / 86400000) + 1;
  return { inRange: true, dayIndex, totalDays: range.totalDays };
}

function isExcluded(title, excludeList) {
  if (!title || !excludeList) return false;
  // Normalizza in array
  const list = Array.isArray(excludeList) ? excludeList : [excludeList];
  if (list.length === 0) return false;
  const titleLower = String(title).toLowerCase();
  for (const kw of list) {
    if (kw == null) continue;
    const kwClean = String(kw).toLowerCase().trim();
    if (kwClean.length === 0) continue;  // ignora keyword vuote
    if (titleLower.includes(kwClean)) return true;
  }
  return false;
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
    exclude_keywords: "Parole chiave da escludere",
    exclude_placeholder: "es. Compleanno, Riunione",
    exclude_add: "Aggiungi",
    exclude_help: "Eventi e task con titolo contenente queste parole verranno nascosti (match parziale, case-insensitive)",
    // ─── Editor UI ───
    ed_entities: "Entità",
    ed_calendars: "Calendari",
    ed_add_calendar: "Aggiungi calendario",
    ed_add_todo: "Aggiungi lista",
    ed_todo_lists: "Liste todo",
    ed_general: "Generale",
    ed_header: "Header",
    ed_layout: "Layout",
    ed_event_detail: "Dettaglio evento",
    ed_localization: "Localizzazione",
    ed_lang_label: "Lingua",
    ed_time_format: "Formato ora",
    ed_first_day: "Primo giorno della settimana",
    opt_system_default: "Predefinito di sistema",
    opt_24h: "24 ore (13:30)",
    opt_12h: "12 ore (1:30 PM)",
    opt_monday: "Lunedì",
    opt_sunday: "Domenica",
    opt_saturday: "Sabato",
    ed_display: "Visualizzazione",
    ed_weather: "Meteo",
    ed_tasks: "Task",
    ed_filters: "Filtri",
    ed_interactions: "Interazioni",
    ed_title: "Titolo",
    ed_days_to_show: "Giorni da mostrare",
    ed_max_events_visible: "Numero massimo eventi visibili",
    ed_show_title: "Mostra titolo",
    ed_show_current_date: "Mostra data corrente",
    ed_show_view_switch: "Mostra pulsante cambia vista",
    ed_show_refresh: "Mostra pulsante refresh",
    ed_show_add_event: "Mostra pulsante aggiungi evento",
    add_event: "Aggiungi evento",
    add_type_event: "Evento",
    add_type_task: "Task",
    add_calendar: "Calendario",
    add_list: "Lista",
    add_summary: "Titolo",
    add_title_ph: "Titolo",
    add_all_day: "Tutto il giorno",
    add_start: "Inizio",
    add_end: "Fine",
    add_due: "Scadenza (opzionale)",
    add_description: "Descrizione (opzionale)",
    add_location: "Luogo (opzionale)",
    add_saving: "Salvataggio…",
    add_cancel: "Annulla",
    add_save: "Salva",
    add_err_title: "Inserisci un titolo",
    add_err_dates: "Inserisci data di inizio e fine",
    add_err_endbefore: "La fine deve essere dopo l'inizio",
    add_err_generic: "Errore durante il salvataggio",
    ed_show_collapse: "Mostra pulsante collassa",
    ed_limit_events: "Limita eventi visibili (attiva scrollbar)",
    ed_compact_mode: "Modalità compatta (spazi ridotti)",
    ed_show_week_number: "Mostra numero settimana",
    ed_show_end_time: "Mostra orario di fine",
    ed_multi_day_events: "Mostra eventi multi-giorno in tutti i giorni",
    ed_month_view: "Vista calendario mensile (griglia)",
    day_no_events: "Nessun evento o task",
    month_pick: "Vai al mese",
    month_label: "Mese",
    year_label: "Anno",
    month_today_btn: "Oggi",
    month_go: "Vai",
    ed_background: "Sfondo",
    ed_transparent: "Sfondo trasparente",
    ed_background_image: "Immagine di sfondo (URL o percorso /local/…)",
    ed_overlay: "Velo: più chiaro ⟵ niente ⟶ più scuro",
    ed_ov_lighter: "Chiaro",
    ed_ov_zero: "0",
    ed_ov_darker: "Scuro",
    ed_show_empty_days: "Mostra giorni vuoti",
    ed_show_relative_time: "Mostra tempo relativo (tra X giorni)",
    ed_show_source: "Mostra origine (calendario/lista)",
    ed_show_description: "Mostra descrizione",
    ed_show_location: "Mostra location (eventi calendario)",
    ed_location_clickable: "Rendi location cliccabile (apre mappe)",
    ed_weather_entity: "Entità meteo",
    ed_show_weather: "Mostra meteo",
    ed_show_weather_today: "Mostra meteo di oggi (widget in alto)",
    ed_show_weather_per_day: "Mostra meteo per giorno (accanto alla data)",
    ed_show_no_date: "Mostra task senza data",
    ed_show_overdue: "Mostra task scaduti",
    ed_overdue_days: "Giorni scaduti da mostrare (0 = tutti)",
    ed_completed_days: "Giorni completati da mostrare",
    ed_show_completed: "Mostra task completati",
    ed_allow_complete: "Consenti completamento task",
    ed_action: "Azione",
    ed_act_none: "Nessuna",
    ed_act_more_info: "Maggiori info",
    ed_act_toggle: "Attiva/disattiva",
    ed_act_navigate: "Naviga",
    ed_act_url: "URL",
    ed_act_call_service: "Chiama servizio",
    ed_act_assist: "Assist",
    ed_param_path: "Percorso",
    ed_param_url: "URL",
    ed_param_service: "Servizio",
    ed_param_entity: "Entità (opzionale)",
    ed_data_json: "Dati (JSON)",
    ed_choose_color: "Scegli colore",
    ed_automatic: "Automatico",
    ed_tap: "Tap",
    ed_hold: "Pressione lunga",
    ed_double_tap: "Doppio tap",
    week_short: "Sett.",
    collapse_all: "Comprimi tutto",
    expand_all: "Espandi tutto",
    refresh: "Aggiorna",
    switch_to_month: "Vista mese",
    switch_to_agenda: "Vista agenda",
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
    exclude_keywords: "Exclude keywords",
    exclude_placeholder: "e.g. Birthday, Meeting",
    exclude_add: "Add",
    exclude_help: "Events and tasks with titles containing these keywords will be hidden (partial match, case-insensitive)",
    // ─── Editor UI ───
    ed_entities: "Entities",
    ed_calendars: "Calendars",
    ed_add_calendar: "Add calendar",
    ed_add_todo: "Add todo list",
    ed_todo_lists: "Todo lists",
    ed_general: "General",
    ed_header: "Header",
    ed_layout: "Layout",
    ed_event_detail: "Event detail",
    ed_localization: "Localization",
    ed_lang_label: "Language",
    ed_time_format: "Time format",
    ed_first_day: "First day of the week",
    opt_system_default: "System default",
    opt_24h: "24 hours (13:30)",
    opt_12h: "12 hours (1:30 PM)",
    opt_monday: "Monday",
    opt_sunday: "Sunday",
    opt_saturday: "Saturday",
    ed_display: "Display",
    ed_weather: "Weather",
    ed_tasks: "Tasks",
    ed_filters: "Filters",
    ed_interactions: "Interactions",
    ed_title: "Title",
    ed_days_to_show: "Days to show",
    ed_max_events_visible: "Max events visible",
    ed_show_title: "Show title",
    ed_show_current_date: "Show current date",
    ed_show_view_switch: "Show view switch button",
    ed_show_refresh: "Show refresh button",
    ed_show_add_event: "Show add event button",
    add_event: "Add event",
    add_type_event: "Event",
    add_type_task: "Task",
    add_calendar: "Calendar",
    add_list: "List",
    add_summary: "Title",
    add_title_ph: "Title",
    add_all_day: "All day",
    add_start: "Start",
    add_end: "End",
    add_due: "Due date (optional)",
    add_description: "Description (optional)",
    add_location: "Location (optional)",
    add_saving: "Saving…",
    add_cancel: "Cancel",
    add_save: "Save",
    add_err_title: "Please enter a title",
    add_err_dates: "Please enter start and end dates",
    add_err_endbefore: "End must be after start",
    add_err_generic: "Error while saving",
    ed_show_collapse: "Show collapse button",
    ed_limit_events: "Limit visible events (enable scrollbar)",
    ed_compact_mode: "Compact mode (reduced spacing)",
    ed_show_week_number: "Show week number",
    ed_show_end_time: "Show end time",
    ed_multi_day_events: "Show multi-day events on every day",
    ed_month_view: "Monthly calendar view (grid)",
    day_no_events: "No events or tasks",
    month_pick: "Go to month",
    month_label: "Month",
    year_label: "Year",
    month_today_btn: "Today",
    month_go: "Go",
    ed_background: "Background",
    ed_transparent: "Transparent background",
    ed_background_image: "Background image (URL or /local/… path)",
    ed_overlay: "Overlay: lighter ⟵ none ⟶ darker",
    ed_ov_lighter: "Lighter",
    ed_ov_zero: "0",
    ed_ov_darker: "Darker",
    ed_show_empty_days: "Show empty days",
    ed_show_relative_time: "Show relative time (in X days)",
    ed_show_source: "Show source (calendar/list)",
    ed_show_description: "Show description",
    ed_show_location: "Show location (calendar events)",
    ed_location_clickable: "Make location clickable (opens maps)",
    ed_weather_entity: "Weather entity",
    ed_show_weather: "Show weather",
    ed_show_weather_today: "Show today's weather (top widget)",
    ed_show_weather_per_day: "Show weather per day (next to date)",
    ed_show_no_date: "Show tasks without a date",
    ed_show_overdue: "Show overdue tasks",
    ed_overdue_days: "Overdue days to show (0 = all)",
    ed_completed_days: "Completed days to show",
    ed_show_completed: "Show completed tasks",
    ed_allow_complete: "Allow completing tasks",
    ed_action: "Action",
    ed_act_none: "None",
    ed_act_more_info: "More info",
    ed_act_toggle: "Toggle",
    ed_act_navigate: "Navigate",
    ed_act_url: "URL",
    ed_act_call_service: "Call service",
    ed_act_assist: "Assist",
    ed_param_path: "Path",
    ed_param_url: "URL",
    ed_param_service: "Service",
    ed_param_entity: "Entity (optional)",
    ed_data_json: "Data (JSON)",
    ed_choose_color: "Choose color",
    ed_automatic: "Automatic",
    ed_tap: "Tap",
    ed_hold: "Hold",
    ed_double_tap: "Double tap",
    week_short: "Wk",
    collapse_all: "Collapse all",
    expand_all: "Expand all",
    refresh: "Refresh",
    switch_to_month: "Month view",
    switch_to_agenda: "Agenda view",
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
  // Traduzione tedesca contribuita da @CptPICHU (issue #4). Grazie!
  de: {
    agenda: "Agenda",
    today: "Heute",
    tomorrow: "Morgen",
    yesterday: "Gestern",
    no_events: (n) => n === 1 ? "Morgen kein Ereignis" : `Kein Ereignis innerhalb ${n} Tage`,
    no_events_day: "Keine Ereignisse",
    all_day: "Ganztägig",
    overdue: "Überfällig",
    no_date: "Kein Datum",
    completed: "Erledigt",
    open_in_maps: "Öffne Karte",
    weather_today: "Heute",
    weather_min: "Min",
    weather_max: "Max",
    weather_humidity: "Luftfeuchte",
    exclude_keywords: "Wörter ausschließen",
    exclude_placeholder: "zb. Geburtstag, Meeting",
    exclude_add: "Hinzufügen",
    exclude_help: "Ereignisse und Aufgaben, die diese Wörter enthalten, werden nicht angezeigt",
    // ─── Editor UI ───
    ed_entities: "Entities",
    ed_calendars: "Kalender",
    ed_add_calendar: "Kalender hinzufügen",
    ed_add_todo: "Liste hinzufügen",
    ed_todo_lists: "Todo Liste",
    ed_general: "Allgemein",
    ed_header: "Kopfzeile",
    ed_layout: "Layout",
    ed_event_detail: "Ereignisdetails",
    ed_localization: "Sprache",
    ed_lang_label: "Sprache",
    ed_time_format: "Zeitformat",
    ed_first_day: "Erster Tag der Woche",
    opt_system_default: "Systemstandard",
    opt_24h: "24 Stunden (13:30)",
    opt_12h: "12 Stunden (1:30 PM)",
    opt_monday: "Montag",
    opt_sunday: "Sonntag",
    opt_saturday: "Samstag",
    ed_display: "Anzeige",
    ed_weather: "Wetter",
    ed_tasks: "Aufgaben",
    ed_filters: "Filter",
    ed_interactions: "Interaktionen",
    ed_title: "Titel",
    ed_days_to_show: "Tage anzeigen",
    ed_max_events_visible: "Max Ereignisse",
    ed_show_title: "Titel anzeigen",
    ed_show_current_date: "Aktuelles Datum anzeigen",
    ed_show_view_switch: "Ansichtswechsel-Button anzeigen",
    ed_show_refresh: "Neu laden anzeigen",
    ed_show_add_event: "Ereignis-Button anzeigen",
    add_event: "Ereignis hinzufügen",
    add_type_event: "Ereignis",
    add_type_task: "Aufgabe",
    add_calendar: "Kalender",
    add_list: "Liste",
    add_summary: "Titel",
    add_title_ph: "Titel",
    add_all_day: "Ganztägig",
    add_start: "Beginn",
    add_end: "Ende",
    add_due: "Fällig (optional)",
    add_description: "Beschreibung (optional)",
    add_location: "Ort (optional)",
    add_saving: "Speichern…",
    add_cancel: "Abbrechen",
    add_save: "Speichern",
    add_err_title: "Bitte einen Titel eingeben",
    add_err_dates: "Bitte Start- und Enddatum eingeben",
    add_err_endbefore: "Ende muss nach dem Beginn liegen",
    add_err_generic: "Fehler beim Speichern",
    ed_show_collapse: "Zeige Einklapp-Button",
    ed_limit_events: "Ereignisanzeige begrenzen (Scrollbar)",
    ed_compact_mode: "Kompaktmodus (kleinere Abstände)",
    ed_show_week_number: "Zeige Kalenderwoche",
    ed_show_end_time: "Zeige Endzeit",
    ed_multi_day_events: "Mehrtägige Ereignisse an allen Tagen zeigen",
    ed_month_view: "Monatskalender-Ansicht (Raster)",
    day_no_events: "Keine Ereignisse oder Aufgaben",
    month_pick: "Zum Monat gehen",
    month_label: "Monat",
    year_label: "Jahr",
    month_today_btn: "Heute",
    month_go: "Los",
    ed_background: "Hintergrund",
    ed_transparent: "Transparenter Hintergrund",
    ed_background_image: "Hintergrundbild (URL oder /local/…-Pfad)",
    ed_overlay: "Überlagerung: heller ⟵ keine ⟶ dunkler",
    ed_ov_lighter: "Heller",
    ed_ov_zero: "0",
    ed_ov_darker: "Dunkler",
    ed_show_empty_days: "Zeige leere Tage",
    ed_show_relative_time: "Zeige relative Zeit (in X Tagen)",
    ed_show_source: "Zeige Quelle",
    ed_show_description: "Zeige Beschreibung",
    ed_show_location: "Zeige Ereignisorte",
    ed_location_clickable: "Ort klickbar (öffnet Karte)",
    ed_weather_entity: "Wetter Entität",
    ed_show_weather: "Zeige Wetter",
    ed_show_weather_today: "Zeige heutiges Wetter",
    ed_show_weather_per_day: "Zeige Wetterbericht (nächste Tage)",
    ed_show_no_date: "Zeige Aufgaben ohne Datum",
    ed_show_overdue: "Zeige überfällige Aufgaben",
    ed_overdue_days: "Überfällig anzeigen für X Tage (0 = Alle)",
    ed_completed_days: "Erledigte Tage anzeigen",
    ed_show_completed: "Zeige erledigte Aufgaben",
    ed_allow_complete: "Erlaube Aufgaben abhaken",
    ed_action: "Aktion",
    ed_act_none: "Keine",
    ed_act_more_info: "Mehr Infos",
    ed_act_toggle: "Umschalten",
    ed_act_navigate: "Navigieren",
    ed_act_url: "URL",
    ed_act_call_service: "Dienst aufrufen",
    ed_act_assist: "Assist",
    ed_param_path: "Pfad",
    ed_param_url: "URL",
    ed_param_service: "Dienst",
    ed_param_entity: "Entität (optional)",
    ed_data_json: "Daten (JSON)",
    ed_choose_color: "Farbe wählen",
    ed_automatic: "Automatisch",
    ed_tap: "Klick",
    ed_hold: "Halten",
    ed_double_tap: "Doppelklick",
    week_short: "KW",
    collapse_all: "Alle einklappen",
    expand_all: "Alle ausklappen",
    refresh: "Neu laden",
    switch_to_month: "Monatsansicht",
    switch_to_agenda: "Agenda-Ansicht",
    days_missing_one: "In 1 Tag",
    days_missing_n: (n) => `In ${n} Tagen`,
    week_missing_one: "In 1 Woche",
    weeks_missing_two: "In 2 Wochen",
    month_missing_one: "In etwa 1 Monat",
    months_missing_n: (n) => `In etwa ${n} Monaten`,
    overdue_one: "1 Tag überfällig",
    overdue_n: (n) => `${n} Tage überfällig`,
    overdue_week_one: "1 Woche überfällig",
    overdue_weeks_two: "2 Wochen überfällig",
    overdue_month_one: "Etwa 1 Monat überfällig",
    overdue_months_n: (n) => `Etwa ${n} Monate überfällig`,
    days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  },
  // Traduzione francese contribuita da @JourMic (issue #6). Merci !
  fr: {
    agenda: "Agenda",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    yesterday: "Hier",
    no_events: (n) => n === 1 ? "Aucun événement le prochain jour" : `Aucun événement dans les ${n} prochains jours`,
    no_events_day: "Aucun événement",
    all_day: "Toute la journée",
    overdue: "En retard",
    no_date: "Sans date",
    completed: "Terminé",
    open_in_maps: "Ouvrir dans Maps",
    weather_today: "Aujourd'hui",
    weather_min: "Min",
    weather_max: "Max",
    weather_humidity: "Humidité",
    exclude_keywords: "Mots-clés à exclure",
    exclude_placeholder: "ex. Anniversaire, Réunion",
    exclude_add: "Ajouter",
    exclude_help: "Les événements et tâches dont le titre contient ces mots-clés seront masqués (correspondance partielle, insensible à la casse)",
    // ─── Editor UI ───
    ed_entities: "Entités",
    ed_calendars: "Calendriers",
    ed_add_calendar: "Ajouter un calendrier",
    ed_add_todo: "Ajouter une liste",
    ed_todo_lists: "Listes de tâches",
    ed_general: "Général",
    ed_header: "En-tête",
    ed_layout: "Disposition",
    ed_event_detail: "Détail de l'événement",
    ed_localization: "Localisation",
    ed_lang_label: "Langue",
    ed_time_format: "Format de l'heure",
    ed_first_day: "Premier jour de la semaine",
    opt_system_default: "Par défaut du système",
    opt_24h: "24 heures (13:30)",
    opt_12h: "12 heures (1:30 PM)",
    opt_monday: "Lundi",
    opt_sunday: "Dimanche",
    opt_saturday: "Samedi",
    ed_display: "Affichage",
    ed_weather: "Météo",
    ed_tasks: "Tâches",
    ed_filters: "Filtres",
    ed_interactions: "Interactions",
    ed_title: "Titre",
    ed_days_to_show: "Jours à afficher",
    ed_max_events_visible: "Nombre max d'événements visibles",
    ed_show_title: "Afficher le titre",
    ed_show_current_date: "Afficher la date du jour",
    ed_show_view_switch: "Afficher le bouton de changement de vue",
    ed_show_refresh: "Afficher le bouton actualiser",
    ed_show_add_event: "Afficher le bouton ajouter",
    add_event: "Ajouter un événement",
    add_type_event: "Événement",
    add_type_task: "Tâche",
    add_calendar: "Calendrier",
    add_list: "Liste",
    add_summary: "Titre",
    add_title_ph: "Titre",
    add_all_day: "Toute la journée",
    add_start: "Début",
    add_end: "Fin",
    add_due: "Date d'échéance (facultatif)",
    add_description: "Description (facultatif)",
    add_location: "Lieu (facultatif)",
    add_saving: "Enregistrement…",
    add_cancel: "Annuler",
    add_save: "Enregistrer",
    add_err_title: "Veuillez saisir un titre",
    add_err_dates: "Veuillez saisir les dates de début et de fin",
    add_err_endbefore: "La fin doit être après le début",
    add_err_generic: "Erreur lors de l'enregistrement",
    ed_show_collapse: "Afficher le bouton réduire",
    ed_limit_events: "Limiter les événements visibles (barre de défilement)",
    ed_compact_mode: "Mode compact (espacement réduit)",
    ed_show_week_number: "Afficher le numéro de semaine",
    ed_show_end_time: "Afficher l'heure de fin",
    ed_multi_day_events: "Afficher les événements multi-jours chaque jour",
    ed_month_view: "Vue calendrier mensuel (grille)",
    day_no_events: "Aucun événement ou tâche",
    month_pick: "Aller au mois",
    month_label: "Mois",
    year_label: "Année",
    month_today_btn: "Aujourd'hui",
    month_go: "Aller",
    ed_background: "Arrière-plan",
    ed_transparent: "Arrière-plan transparent",
    ed_background_image: "Image d'arrière-plan",
    ed_overlay: "Voile : plus clair ⟵ aucun ⟶ plus foncé",
    ed_ov_lighter: "Plus clair",
    ed_ov_zero: "0",
    ed_ov_darker: "Plus foncé",
    ed_show_empty_days: "Afficher les jours vides",
    ed_show_relative_time: "Afficher le temps relatif (dans X jours)",
    ed_show_source: "Afficher la source (calendrier/liste)",
    ed_show_description: "Afficher la description",
    ed_show_location: "Afficher le lieu (événements calendrier)",
    ed_location_clickable: "Rendre le lieu cliquable (ouvre Maps)",
    ed_weather_entity: "Entité météo",
    ed_show_weather: "Afficher la météo",
    ed_show_weather_today: "Afficher la météo du jour (widget en haut)",
    ed_show_weather_per_day: "Afficher la météo par jour (à côté de la date)",
    ed_show_no_date: "Afficher les tâches sans date",
    ed_show_overdue: "Afficher les tâches en retard",
    ed_overdue_days: "Jours de retard à afficher (0 = tous)",
    ed_completed_days: "Jours terminés à afficher",
    ed_show_completed: "Afficher les tâches terminées",
    ed_allow_complete: "Permettre de terminer les tâches",
    ed_action: "Action",
    ed_act_none: "Aucune",
    ed_act_more_info: "Plus d'infos",
    ed_act_toggle: "Basculer",
    ed_act_navigate: "Naviguer",
    ed_act_url: "URL",
    ed_act_call_service: "Appeler un service",
    ed_act_assist: "Assist",
    ed_param_path: "Chemin",
    ed_param_url: "URL",
    ed_param_service: "Service",
    ed_param_entity: "Entité (facultatif)",
    ed_data_json: "Données (JSON)",
    ed_choose_color: "Choisir la couleur",
    ed_automatic: "Automatique",
    ed_tap: "Appui",
    ed_hold: "Appui long",
    ed_double_tap: "Double appui",
    week_short: "Sem.",
    collapse_all: "Tout réduire",
    expand_all: "Tout développer",
    refresh: "Actualiser",
    switch_to_month: "Vue mois",
    switch_to_agenda: "Vue agenda",
    days_missing_one: "Dans 1 jour",
    days_missing_n: (n) => `Dans ${n} jours`,
    week_missing_one: "Dans 1 semaine",
    weeks_missing_two: "Dans 2 semaines",
    month_missing_one: "Dans environ 1 mois",
    months_missing_n: (n) => `Dans environ ${n} mois`,
    overdue_one: "1 jour de retard",
    overdue_n: (n) => `${n} jours de retard`,
    overdue_week_one: "1 semaine de retard",
    overdue_weeks_two: "2 semaines de retard",
    overdue_month_one: "Environ 1 mois de retard",
    overdue_months_n: (n) => `Environ ${n} mois de retard`,
    days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  },
};

/* Risolve la lingua effettiva da usare.
   - Se `configLang` è esplicito (non "auto"): usa quella se supportata, altrimenti "en".
   - Se `configLang` è "auto" (o vuoto):
     - Se HA ha una lingua impostata (`hassLanguage`), la usiamo se supportata,
       altrimenti fallback diretto su "en" (senza controllare navigator, per non
       "sovrascrivere" una scelta esplicita dell'utente in HA con la lingua del
       browser — es. utente italiano con HA in francese avrebbe visto italiano).
     - Se HA non ha lingua impostata (raro), proviamo navigator, poi "en". */
function resolveLanguage(configLang, hassLanguage) {
  if (configLang && configLang !== "auto") {
    return I18N[configLang] ? configLang : "en";
  }
  // configLang è "auto" o vuoto: seguiamo la lingua di HA
  if (hassLanguage) {
    const short = String(hassLanguage).toLowerCase().split("-")[0];
    return I18N[short] ? short : "en";
  }
  // HA non ha lingua: proviamo navigator, poi fallback en
  const navLang = (typeof navigator !== "undefined" && navigator.language) || "";
  if (navLang) {
    const short = navLang.toLowerCase().split("-")[0];
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

/* Costruisce una Date corretta da un raw di evento (start o end).
   CRITICO per i fusi orari: le date all-day arrivano come "2026-07-21" e
   `new Date("2026-07-21")` le interpreta come mezzanotte UTC. In un fuso a
   ovest di UTC (es. America/New_York = UTC-4) quella mezzanotte UTC cade alle
   20:00 del giorno PRIMA in orario locale, quindi l'evento finiva nel giorno
   sbagliato. parseDueDate gestisce già le date-only interpretandole in orario
   locale, quindi la riusiamo. Le date con orario (`dateTime`) hanno un offset
   e vengono lasciate a Date come prima.
   Grazie a @kielsucks per la diagnosi e il fix originale (issue #3 / PR #2). */
function parseEventDate(raw) {
  if (!raw) return null;
  return parseDueDate(raw);
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
    const prevMonthView = this._config?.month_view;
    this._config = {
      ...DEFAULT_CONFIG,
      calendars: [], todos: [],
      ...config,
    };
    // Se il default della vista è cambiato (es. toggle nell'editor), azzero
    // l'override di sessione così il nuovo default vince subito.
    if (this._config.month_view !== prevMonthView) {
      this._viewOverride = undefined;
    }
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
    // Riapplica i filtri ai dati grezzi (necessario quando cambia `exclude`
    // dall'editor: senza questo, gli eventi/task filtrati restano gli stessi
    // perché _events/_tasks vengono popolati solo da _fetchAll).
    this._applyFilters();
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
    // Prenota subito lo slot temporale PRIMA di qualsiasi await: `set hass()`
    // scatta a ogni cambio di stato di qualsiasi entità e, con un fetch in volo
    // (2-5 s su CalDAV), vedrebbe ancora il timestamp vecchio e lancerebbe altri
    // _fetchAll() duplicati (6-10 richieste identiche per ciclo). Assegnando qui
    // _lastFetch, i set hass() successivi durante il fetch trovano il timestamp
    // aggiornato e non ripartono. Non usiamo `if (this._loading) return` perché,
    // se _fetchAll lanciasse un'eccezione, _loading resterebbe true e la card non
    // si aggiornerebbe mai più. (issue #12)
    this._lastFetch = Date.now();
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

    // Finestra di caricamento eventi.
    // - Vista agenda: da oggi a oggi+days.
    // - Vista griglia mensile: l'intero mese visibile (le 6 settimane della
    //   griglia, cioè dal primo giorno mostrato all'ultimo), così i pallini
    //   compaiono su tutti i giorni del mese che hanno qualcosa, non solo sui
    //   primi `days` giorni.
    let start = new Date();
    let end = new Date();
    if (this._resolveMonthView()) {
      const hassLanguage = this._hass?.locale?.language || this._hass?.language || null;
      const dispLocale = this._config.language && this._config.language !== "auto"
        ? this._config.language
        : (hassLanguage || (typeof navigator !== "undefined" ? navigator.language : "it-IT"));
      const fdow = resolveFirstDayOfWeek(this._config.first_day_of_week, dispLocale);
      const now = new Date();
      const offsetMonths = this._monthOffset || 0;
      const first = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
      first.setHours(0, 0, 0, 0);
      const offset = (first.getDay() - fdow + 7) % 7;
      start = new Date(first);
      start.setDate(first.getDate() - offset);
      // 42 celle (6 righe) coprono qualsiasi mese; end = start + 42 giorni
      end = new Date(start);
      end.setDate(start.getDate() + 42);
    } else {
      end.setDate(end.getDate() + (this._config.days || 7));
    }
    const [events, tasks, weatherForecast] = await Promise.all([
      this._fetchCalendarEvents(start, end),
      this._fetchTodoItems(),
      this._fetchWeatherForecast(),
    ]);
    // Memorizza i dati GREZZI (senza filtri) in _eventsRaw/_tasksRaw.
    // I dati filtrati vengono ricalcolati ad ogni render (e ad ogni cambio di
    // configurazione) tramite _applyFilters, così che modifiche al filtro
    // exclude si riflettano subito senza serve un refetch.
    this._eventsRaw = events;
    this._tasksRaw = tasks;
    this._weatherForecast = weatherForecast;
    this._applyFilters();
    this._loading = false;
    // Riallinea il timestamp alla fine del fetch completato: il primo assegnamento
    // a inizio metodo blocca i duplicati durante il fetch, questo mantiene
    // l'intervallo "dall'ultimo fetch riuscito". (issue #12)
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
    results.sort((a, b) => parseEventDate(a.start.dateTime || a.start.date) - parseEventDate(b.start.dateTime || b.start.date));
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

  /* Apre un form inline (dentro la card) per creare un evento o un task.
     Non usiamo il dialog nativo di HA: una card esterna non può aprirlo in modo
     affidabile (il percorso interno del dialog non è accessibile). Usiamo invece
     i servizi ufficiali di HA, stabili e documentati:
       - eventi calendario → calendar.create_event
       - task todo         → todo.add_item
     Il form resta dentro la card, così si possono aggiungere più elementi di
     seguito senza cambiare pagina. */
  _openAddEventDialog(presetDate) {
    if (!this._cardElement) return;
    const calendars = (this._config.calendars || []).filter(isValidEntityId);
    const todos = (this._config.todos || []).filter(isValidEntityId);
    if (calendars.length === 0 && todos.length === 0) return;

    // Se un form è già aperto, non ne apro un secondo.
    // L'overlay vive sul document.body (vedi sotto), quindi lo cerco lì.
    if (document.getElementById("ctc-add-overlay")) return;
    // Inietto gli stili del form nel <head> una volta sola: l'overlay sta fuori
    // dalla shadow DOM della card, quindi non erediterebbe gli stili interni.
    if (!document.getElementById("ctc-add-form-styles")) {
      const st = document.createElement("style");
      st.id = "ctc-add-form-styles";
      st.textContent = ADD_FORM_STYLES;
      document.head.appendChild(st);
    }

    let lang = "en";
    try {
      const hl = this._hass && this._hass.locale && this._hass.locale.language
        ? this._hass.locale.language
        : (this._hass && this._hass.language) || null;
      lang = resolveLanguage(this._config && this._config.language, hl);
    } catch (e) { lang = "en"; }

    // Overlay + pannello del form
    const overlay = document.createElement("div");
    overlay.id = "ctc-add-overlay";
    overlay.className = "ctc-add-overlay";
    // Posizionamento rinforzato inline: alcuni contenitori della dashboard HA
    // usano `transform`, che "intrappola" un position:fixed facendolo diventare
    // relativo al contenitore invece che allo schermo. Ancorare esplicitamente a
    // 0/0 rende il form sempre centrato e interamente visibile, a prescindere
    // dall'altezza della card. NB: niente width/height:100vw/100vh qui — su
    // mobile (Safari in particolare) 100vh include l'area dietro la barra degli
    // indirizzi, quindi il pannello risulterebbe "dentro" ai 100vh sulla carta
    // ma tagliato nello schermo visibile reale, senza scroll a raggiungerlo.
    // top/right/bottom/left:0 su un elemento fixed si adatta invece al
    // viewport realmente visibile.
    overlay.style.cssText =
      "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;";

    const panel = document.createElement("div");
    panel.className = "ctc-add-panel";
    overlay.appendChild(panel);

    // Titolo del form
    const h = document.createElement("div");
    h.className = "ctc-add-title";
    h.textContent = t("add_event", lang);
    panel.appendChild(h);

    // Scelta tipo: Evento / Task (solo se ha sia calendari che todo)
    let currentType = calendars.length > 0 ? "event" : "task";
    let typeToggle = null;
    if (calendars.length > 0 && todos.length > 0) {
      typeToggle = document.createElement("div");
      typeToggle.className = "ctc-add-typetoggle";
      const mkTypeBtn = (val, label) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ctc-add-typebtn" + (val === currentType ? " active" : "");
        b.textContent = label;
        b.addEventListener("click", () => {
          currentType = val;
          typeToggle.querySelectorAll(".ctc-add-typebtn").forEach(x => x.classList.remove("active"));
          b.classList.add("active");
          rebuildFields();
        });
        return b;
      };
      typeToggle.append(
        mkTypeBtn("event", t("add_type_event", lang)),
        mkTypeBtn("task", t("add_type_task", lang)),
      );
      panel.appendChild(typeToggle);
    }

    // Contenitore dei campi (ricostruito quando cambia il tipo)
    const fields = document.createElement("div");
    fields.className = "ctc-add-fields";
    panel.appendChild(fields);

    // Helper per una riga label + input
    const mkField = (labelText, inputEl) => {
      const row = document.createElement("div");
      row.className = "ctc-add-field";
      const l = document.createElement("label");
      l.textContent = labelText;
      row.append(l, inputEl);
      return row;
    };

    // Formatta una Date in valore per <input type=datetime-local> (ora locale)
    const toLocalInput = (d) => {
      const p = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    const toDateInput = (d) => {
      const p = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };

    // Riferimenti agli input, popolati da rebuildFields
    let inpTarget, inpTitle, inpStart, inpEnd, inpAllDay, inpDue, inpDesc, inpLoc, errBox;

    const rebuildFields = () => {
      fields.innerHTML = "";

      // Selettore calendario/lista
      inpTarget = document.createElement("select");
      inpTarget.className = "ctc-native-input wide";
      const list = currentType === "event" ? calendars : todos;
      list.forEach(entId => {
        const opt = document.createElement("option");
        opt.value = entId;
        // Nome leggibile dall'entità, se disponibile
        const friendly = this._hass?.states?.[entId]?.attributes?.friendly_name;
        opt.textContent = friendly || entId;
        inpTarget.appendChild(opt);
      });
      fields.appendChild(mkField(
        currentType === "event" ? t("add_calendar", lang) : t("add_list", lang),
        inpTarget,
      ));

      // Titolo
      inpTitle = document.createElement("input");
      inpTitle.type = "text";
      inpTitle.className = "ctc-native-input wide";
      inpTitle.placeholder = t("add_title_ph", lang);
      blockHAShortcuts(inpTitle);
      fields.appendChild(mkField(t("add_summary", lang), inpTitle));

      if (currentType === "event") {
        // Tutto il giorno
        inpAllDay = document.createElement("input");
        inpAllDay.type = "checkbox";
        inpAllDay.className = "ctc-add-check";
        const allDayRow = mkField(t("add_all_day", lang), inpAllDay);
        allDayRow.classList.add("ctc-add-inline");
        fields.appendChild(allDayRow);

        // Se è stata passata una data (dal popup del giorno), la uso come base,
        // mantenendo l'ora corrente. Altrimenti parto da adesso.
        let now = new Date();
        if (presetDate) {
          const base = new Date(presetDate);
          base.setHours(now.getHours(), now.getMinutes(), 0, 0);
          now = base;
        }
        const inOneHour = new Date(now.getTime() + 3600000);

        // Inizio / Fine
        inpStart = document.createElement("input");
        inpStart.type = "datetime-local";
        inpStart.className = "ctc-native-input wide";
        inpStart.value = toLocalInput(now);
        blockHAShortcuts(inpStart);
        const startRow = mkField(t("add_start", lang), inpStart);
        fields.appendChild(startRow);

        inpEnd = document.createElement("input");
        inpEnd.type = "datetime-local";
        inpEnd.className = "ctc-native-input wide";
        inpEnd.value = toLocalInput(inOneHour);
        blockHAShortcuts(inpEnd);
        const endRow = mkField(t("add_end", lang), inpEnd);
        fields.appendChild(endRow);

        // Quando "tutto il giorno" è attivo, gli input diventano solo-data
        inpAllDay.addEventListener("change", () => {
          const allDay = inpAllDay.checked;
          inpStart.type = allDay ? "date" : "datetime-local";
          inpEnd.type = allDay ? "date" : "datetime-local";
          inpStart.value = allDay ? toDateInput(now) : toLocalInput(now);
          inpEnd.value = allDay ? toDateInput(now) : toLocalInput(inOneHour);
        });

        // Luogo (opzionale)
        inpLoc = document.createElement("input");
        inpLoc.type = "text";
        inpLoc.className = "ctc-native-input wide";
        blockHAShortcuts(inpLoc);
        fields.appendChild(mkField(t("add_location", lang), inpLoc));

        // Descrizione (opzionale)
        inpDesc = document.createElement("textarea");
        inpDesc.className = "ctc-native-input wide ctc-add-textarea";
        inpDesc.rows = 2;
        blockHAShortcuts(inpDesc);
        fields.appendChild(mkField(t("add_description", lang), inpDesc));
      } else {
        // Task: data di scadenza opzionale
        inpDue = document.createElement("input");
        inpDue.type = "date";
        inpDue.className = "ctc-native-input wide";
        // Se apro dal popup di un giorno, preimposto quella data come scadenza
        if (presetDate) {
          const p = (n) => String(n).padStart(2, "0");
          inpDue.value = `${presetDate.getFullYear()}-${p(presetDate.getMonth() + 1)}-${p(presetDate.getDate())}`;
        }
        blockHAShortcuts(inpDue);
        fields.appendChild(mkField(t("add_due", lang), inpDue));

        // Descrizione task (opzionale) — todo.add_item accetta description
        inpDesc = document.createElement("textarea");
        inpDesc.className = "ctc-native-input wide ctc-add-textarea";
        inpDesc.rows = 2;
        blockHAShortcuts(inpDesc);
        fields.appendChild(mkField(t("add_description", lang), inpDesc));
      }

      // Box errore (nascosto finché non serve)
      errBox = document.createElement("div");
      errBox.className = "ctc-add-error";
      errBox.style.display = "none";
      fields.appendChild(errBox);
    };
    rebuildFields();

    // Pulsanti Annulla / Salva
    const actions = document.createElement("div");
    actions.className = "ctc-add-actions";
    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.className = "ctc-add-btn ctc-add-cancel";
    btnCancel.textContent = t("add_cancel", lang);
    const btnSave = document.createElement("button");
    btnSave.type = "button";
    btnSave.className = "ctc-add-btn ctc-add-save";
    btnSave.textContent = t("add_save", lang);
    actions.append(btnCancel, btnSave);
    panel.appendChild(actions);

    const close = () => overlay.remove();
    btnCancel.addEventListener("click", close);
    // Click fuori dal pannello chiude
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    const showErr = (msg) => {
      errBox.textContent = msg;
      errBox.style.display = "block";
    };

    btnSave.addEventListener("click", async () => {
      if (!this._hass) return;
      const target = inpTarget.value;
      const title = (inpTitle.value || "").trim();
      if (!title) { showErr(t("add_err_title", lang)); return; }

      // Indicatore di salvataggio: testo del pulsante + disabilitazione.
      // Utile perché i backend CalDAV possono metterci un paio di secondi.
      const savingLabel = t("add_saving", lang);
      const savedLabel = t("add_save", lang);
      btnSave.disabled = true;
      btnSave.textContent = savingLabel;
      const restoreBtn = () => { btnSave.disabled = false; btnSave.textContent = savedLabel; };
      try {
        if (currentType === "event") {
          const allDay = inpAllDay.checked;
          const data = { entity_id: target, summary: title };
          if (allDay) {
            // Servizio HA: per all-day si usano start_date / end_date (date pure).
            // end_date è ESCLUSIVO: un evento di un giorno ha end = start + 1.
            const s = inpStart.value; // YYYY-MM-DD
            const e = inpEnd.value || s;
            const endD = new Date(e + "T00:00:00");
            endD.setDate(endD.getDate() + 1);
            const p = (n) => String(n).padStart(2, "0");
            const endStr = `${endD.getFullYear()}-${p(endD.getMonth() + 1)}-${p(endD.getDate())}`;
            data.start_date = s;
            data.end_date = endStr;
          } else {
            if (!inpStart.value || !inpEnd.value) { showErr(t("add_err_dates", lang)); restoreBtn(); return; }
            if (new Date(inpEnd.value) <= new Date(inpStart.value)) { showErr(t("add_err_endbefore", lang)); restoreBtn(); return; }
            // datetime-local non ha secondi: li aggiungiamo per il servizio
            data.start_date_time = inpStart.value + ":00";
            data.end_date_time = inpEnd.value + ":00";
          }
          // Luogo e descrizione opzionali
          const loc = (inpLoc?.value || "").trim();
          const desc = (inpDesc?.value || "").trim();
          if (loc) data.location = loc;
          if (desc) data.description = desc;
          await this._hass.callService("calendar", "create_event", data);
        } else {
          // Task
          const data = { entity_id: target, item: title };
          if (inpDue && inpDue.value) data.due_date = inpDue.value;
          const desc = (inpDesc?.value || "").trim();
          if (desc) data.description = desc;
          await this._hass.callService("todo", "add_item", data);
        }
        close();
        this._fetchAll(true);
      } catch (err) {
        showErr(t("add_err_generic", lang) + (err?.message ? `: ${err.message}` : ""));
        restoreBtn();
      }
    });

    // Attacco l'overlay al BODY della pagina, non alla card: così il
    // position:fixed è relativo allo schermo e non viene "intrappolato" dai
    // contenitori della dashboard HA che usano transform (che facevano restare
    // il form dentro la card corta). Il form appare centrato e intero.
    document.body.appendChild(overlay);
    // Focus sul titolo per digitare subito
    setTimeout(() => { try { inpTitle.focus(); } catch (e) {} }, 50);
  }

  /* Costruisce la vista a griglia mensile (statica, primo step).
     Mostra il mese corrente: intestazione col nome del mese, riga dei giorni
     della settimana, e le celle dei giorni numerati, allineate al giorno della
     settimana d'inizio configurato. Oggi è evidenziato; i giorni del mese
     precedente/successivo che riempiono la griglia sono attenuati.
     I pallini eventi/task e il click sul giorno arriveranno nei passi successivi. */
  _buildMonthGrid(displayLocale, firstDayOfWeek, lang, timeFormat) {
    const wrap = document.createElement("div");
    wrap.className = "ctc-month";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Mese visualizzato = mese corrente + offset di navigazione.
    // _monthOffset: 0 = mese corrente, +1 = successivo, -1 = precedente.
    // Persiste durante i refresh di background, riparte da 0 alla riapertura.
    const offsetMonths = this._monthOffset || 0;
    const viewBase = new Date(today.getFullYear(), today.getMonth() + offsetMonths, 1);
    const viewYear = viewBase.getFullYear();
    const viewMonth = viewBase.getMonth(); // 0-based

    // Intestazione: freccia indietro · nome mese+anno · freccia avanti, e "Oggi"
    const header = document.createElement("div");
    header.className = "ctc-month-header";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "ctc-month-nav";
    prevBtn.innerHTML = `<ha-icon icon="mdi:chevron-left"></ha-icon>`;
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._monthOffset = (this._monthOffset || 0) - 1;
      this._fetchAll();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "ctc-month-nav";
    nextBtn.innerHTML = `<ha-icon icon="mdi:chevron-right"></ha-icon>`;
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._monthOffset = (this._monthOffset || 0) + 1;
      this._fetchAll();
    });

    const label = document.createElement("div");
    label.className = "ctc-month-label ctc-month-label-active";
    const monthName = new Date(viewYear, viewMonth, 1)
      .toLocaleDateString(displayLocale, { month: "long" });
    const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    label.textContent = `${monthCap} ${viewYear}`;
    // Cliccando il nome del mese si apre un selettore mese/anno
    label.addEventListener("click", (e) => {
      e.stopPropagation();
      this._openMonthPicker(viewYear, viewMonth, displayLocale, lang);
    });

    header.append(prevBtn, label, nextBtn);
    wrap.appendChild(header);

    // Numero settimana attivo? Se sì, la griglia ha una colonna extra a sinistra.
    const showWeek = this._config.show_week_number === true;

    // Riga dei nomi dei giorni della settimana, a partire dal primo giorno configurato.
    // firstDayOfWeek: 0=domenica, 1=lunedì, 6=sabato (come da resolveFirstDayOfWeek).
    const dowRow = document.createElement("div");
    dowRow.className = "ctc-month-dow";
    if (showWeek) dowRow.classList.add("ctc-month-hasweek");
    // Cella d'angolo vuota sopra la colonna dei numeri di settimana
    if (showWeek) {
      const corner = document.createElement("div");
      corner.className = "ctc-month-dow-cell ctc-month-wk-cell";
      dowRow.appendChild(corner);
    }
    for (let i = 0; i < 7; i++) {
      const dowIndex = (firstDayOfWeek + i) % 7;
      // Prendo un giorno noto di quel weekday per il nome localizzato.
      // 2023-01-01 era una domenica, quindi +dowIndex dà il giorno giusto.
      const sample = new Date(2023, 0, 1 + dowIndex);
      const name = sample.toLocaleDateString(displayLocale, { weekday: "short" });
      const cell = document.createElement("div");
      cell.className = "ctc-month-dow-cell";
      // Abbrevio a 3 lettere max e capitalizzo
      cell.textContent = (name.charAt(0).toUpperCase() + name.slice(1)).slice(0, 3);
      dowRow.appendChild(cell);
    }
    wrap.appendChild(dowRow);

    // Calcolo la prima cella della griglia: il giorno 1 del mese, arretrato fino
    // al primo giorno della settimana configurato.
    const first = new Date(viewYear, viewMonth, 1);
    first.setHours(0, 0, 0, 0);
    let offset = (first.getDay() - firstDayOfWeek + 7) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);

    // Helper: il giorno `d` ha almeno un evento o un task?
    // Eventi: uso getEventDayPosition che copre anche i multi-giorno.
    // Task: confronto la data di scadenza (parseDueDate = orario locale).
    const events = this._events || [];
    const tasks = this._tasks || [];
    const dayHasItems = (d) => {
      const dk = dayKey(d);
      for (const ev of events) {
        const pos = getEventDayPosition(ev, d);
        if (pos.inRange) return true;
      }
      for (const tk of tasks) {
        const due = parseDueDate(tk.due);
        if (due && dayKey(due) === dk) return true;
      }
      return false;
    };

    // Griglia di 6 righe × 7 = 42 celle: copre qualsiasi mese senza tagli.
    const grid = document.createElement("div");
    grid.className = "ctc-month-grid";
    if (showWeek) grid.classList.add("ctc-month-hasweek");
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      d.setHours(0, 0, 0, 0);

      // All'inizio di ogni riga (ogni 7 celle), il numero di settimana ISO
      if (showWeek && i % 7 === 0) {
        const wk = document.createElement("div");
        wk.className = "ctc-month-wk-cell";
        wk.textContent = String(getISOWeekNumber(d));
        grid.appendChild(wk);
      }

      const cell = document.createElement("div");
      cell.className = "ctc-month-cell";
      if (d.getMonth() !== viewMonth) cell.classList.add("ctc-month-other");
      if (d.getTime() === today.getTime()) cell.classList.add("ctc-month-today");

      const num = document.createElement("div");
      num.className = "ctc-month-num";
      num.textContent = String(d.getDate());
      cell.appendChild(num);

      // Pallino neutro se il giorno ha eventi o task
      if (dayHasItems(d)) {
        const dot = document.createElement("div");
        dot.className = "ctc-month-dot";
        cell.appendChild(dot);
      }

      // Click sul giorno → popup con eventi/task di quella data.
      // Tutti i giorni sono cliccabili (anche quelli vuoti: mostrano "nessun
      // evento", così un click non risponde mai in modo che sembri un bug).
      cell.classList.add("ctc-month-clickable");
      const cellDate = new Date(d);
      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        this._openDayPopup(cellDate, displayLocale, firstDayOfWeek, lang, timeFormat);
      });

      grid.appendChild(cell);
    }
    wrap.appendChild(grid);

    return wrap;
  }

  /* Popup di un giorno: mostra eventi e task di quella data, ognuno col colore
     della sua entità, e un pulsante per aggiungere un evento a quella data.
     Riusa lo stesso meccanismo overlay del form aggiungi (attaccato al body per
     evitare i problemi di posizionamento fixed dentro contenitori con transform). */
  _openDayPopup(date, displayLocale, firstDayOfWeek, lang, timeFormat) {
    if (!this._cardElement) return;
    if (document.getElementById("ctc-add-overlay")) return;
    // Riuso gli stili del form (già include l'overlay e il pannello)
    if (!document.getElementById("ctc-add-form-styles")) {
      const st = document.createElement("style");
      st.id = "ctc-add-form-styles";
      st.textContent = ADD_FORM_STYLES;
      document.head.appendChild(st);
    }

    const overlay = document.createElement("div");
    overlay.id = "ctc-add-overlay";
    overlay.className = "ctc-add-overlay";
    overlay.style.cssText =
      "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;";

    const panel = document.createElement("div");
    panel.className = "ctc-add-panel";
    overlay.appendChild(panel);

    // Titolo: data estesa, es. "Lunedì 31 agosto"
    const h = document.createElement("div");
    h.className = "ctc-add-title";
    const titleStr = date.toLocaleDateString(displayLocale, {
      weekday: "long", day: "numeric", month: "long",
    });
    h.textContent = titleStr.charAt(0).toUpperCase() + titleStr.slice(1);
    panel.appendChild(h);

    // Raccolgo eventi e task del giorno
    const events = (this._events || []).filter(ev => getEventDayPosition(ev, date).inRange);
    const dk = dayKey(date);
    const tasks = (this._tasks || []).filter(tk => {
      const due = parseDueDate(tk.due);
      return due && dayKey(due) === dk;
    });

    const list = document.createElement("div");
    list.className = "ctc-day-list";

    if (events.length === 0 && tasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "ctc-day-empty";
      empty.textContent = t("day_no_events", lang);
      list.appendChild(empty);
    } else {
      // Ordino gli eventi per orario di inizio
      events.sort((a, b) =>
        parseEventDate(a.start.dateTime || a.start.date) - parseEventDate(b.start.dateTime || b.start.date));

      const mkRow = (color, title, timeStr, locText, descText, mapsUrl, relText) => {
        const row = document.createElement("div");
        row.className = "ctc-day-row";
        const bar = document.createElement("span");
        bar.className = "ctc-day-bar";
        bar.style.background = color;
        const main = document.createElement("div");
        main.className = "ctc-day-row-main";
        const t1 = document.createElement("div");
        t1.className = "ctc-day-row-title";
        t1.textContent = title;
        main.appendChild(t1);
        if (timeStr) {
          const t2 = document.createElement("div");
          t2.className = "ctc-day-row-time";
          t2.textContent = timeStr;
          main.appendChild(t2);
        }
        // Tempo relativo ("Tra 3 giorni", "Ieri") se attivo
        if (relText) {
          const r = document.createElement("div");
          r.className = "ctc-day-row-rel";
          r.textContent = relText;
          main.appendChild(r);
        }
        // Luogo (con icona pin). Se location_clickable è attivo, lo rendo un
        // link che apre Google Maps, come nell'agenda.
        if (locText) {
          const locEl = document.createElement("div");
          locEl.className = "ctc-day-row-loc";
          const pin = document.createElement("ha-icon");
          pin.setAttribute("icon", "mdi:map-marker");
          pin.className = "ctc-loc-icon";
          let textNode;
          if (mapsUrl) {
            textNode = document.createElement("a");
            textNode.href = mapsUrl;
            textNode.target = "_blank";
            textNode.rel = "noopener noreferrer";
            textNode.className = "ctc-day-row-loc-link";
            textNode.textContent = locText;
            // Evito che il click sul link chiuda il popup o triggeri altro
            textNode.addEventListener("click", (e) => e.stopPropagation());
          } else {
            textNode = document.createElement("span");
            textNode.textContent = locText;
          }
          locEl.append(pin, textNode);
          main.appendChild(locEl);
        }
        // Descrizione
        if (descText) {
          const d = document.createElement("div");
          d.className = "ctc-day-row-desc";
          d.textContent = descText;
          main.appendChild(d);
        }
        row.append(bar, main);
        return row;
      };

      for (const ev of events) {
        const color = getEntityColor(ev._source, this._config);
        const allDay = !ev.start.dateTime;
        // Posizione dell'evento nel suo intervallo multi-giorno (per le frecce)
        const pos = getEventDayPosition(ev, date);
        const dayIndex = pos.dayIndex || 1;
        const totalDays = pos.totalDays || 1;
        let timeStr = "";
        if (allDay) {
          timeStr = t("all_day", lang);
        } else if (totalDays > 1) {
          // Multi-giorno con ora: primo "10:00 →", ultimo "→ 12:00", intermedi "tutto il giorno".
          const s = fmtTimeFormatted(ev.start.dateTime, timeFormat, displayLocale);
          const eAlways = fmtTimeFormatted(ev.end?.dateTime, timeFormat, displayLocale);
          if (dayIndex === 1) timeStr = `${s} →`;
          else if (dayIndex === totalDays) timeStr = `→ ${eAlways}`;
          else timeStr = t("all_day", lang);
        } else {
          // Orario di fine solo se il toggle show_end_time è attivo (come in agenda)
          const s = fmtTimeFormatted(ev.start.dateTime, timeFormat, displayLocale);
          const e = (this._config.show_end_time && ev.end?.dateTime)
            ? fmtTimeFormatted(ev.end.dateTime, timeFormat, displayLocale) : null;
          timeStr = e ? `${s}–${e}` : s;
        }
        // Location e descrizione seguono i rispettivi toggle, come in agenda
        const locText = (this._config.show_location && ev.location) ? formatLocation(ev.location) : "";
        const descText = this._config.show_description ? sanitizeDescription(ev.description) : "";
        // Location cliccabile → link Google Maps (se toggle attivo)
        const mapsUrl = (locText && this._config.location_clickable) ? buildMapsUrl(locText) : "";
        // Tempo relativo (se toggle attivo)
        let relText = "";
        if (this._config.show_relative_time) {
          const evDate = parseEventDate(ev.start.dateTime || ev.start.date);
          relText = formatRelativeTime(evDate, undefined, lang);
        }
        list.appendChild(mkRow(color, ev.summary || "—", timeStr, locText, descText, mapsUrl, relText));
      }
      for (const tk of tasks) {
        const color = getEntityColor(tk._source, this._config);
        const descText = this._config.show_description ? sanitizeDescription(tk.description) : "";
        // Se la scadenza ha un orario (non è mezzanotte), lo mostro
        const due = parseDueDate(tk.due);
        let timeStr = "";
        if (due && (due.getHours() !== 0 || due.getMinutes() !== 0)) {
          timeStr = fmtTimeFormatted(due.toISOString(), timeFormat, displayLocale);
        }
        // Tempo relativo del task (se toggle attivo e ha una scadenza)
        let relText = "";
        if (this._config.show_relative_time && due) {
          relText = formatRelativeTime(due, undefined, lang);
        }
        list.appendChild(mkRow(color, tk.summary || tk.uid || "—", timeStr, "", descText, "", relText));
      }
    }
    panel.appendChild(list);

    // Pulsanti: Aggiungi (con data preimpostata) + Chiudi
    const actions = document.createElement("div");
    actions.className = "ctc-add-actions";
    const btnAdd = document.createElement("button");
    btnAdd.type = "button";
    btnAdd.className = "ctc-add-btn ctc-add-save";
    btnAdd.textContent = t("add_event", lang);
    const btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.className = "ctc-add-btn ctc-add-cancel";
    btnClose.textContent = t("add_cancel", lang);
    actions.append(btnClose, btnAdd);
    panel.appendChild(actions);

    const close = () => overlay.remove();
    btnClose.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    // "Aggiungi": chiudo il popup del giorno e apro il form, preimpostando la data
    btnAdd.addEventListener("click", () => {
      close();
      this._openAddEventDialog(date);
    });

    document.body.appendChild(overlay);
  }

  /* Selettore mese/anno: due liste a tendina (mese e anno) e un pulsante "Oggi".
     La navigazione della griglia usa _monthOffset (differenza in mesi da oggi),
     quindi converto la scelta assoluta mese+anno nell'offset corrispondente. */
  _openMonthPicker(viewYear, viewMonth, displayLocale, lang) {
    if (!this._cardElement) return;
    if (document.getElementById("ctc-add-overlay")) return;
    if (!document.getElementById("ctc-add-form-styles")) {
      const st = document.createElement("style");
      st.id = "ctc-add-form-styles";
      st.textContent = ADD_FORM_STYLES;
      document.head.appendChild(st);
    }

    const overlay = document.createElement("div");
    overlay.id = "ctc-add-overlay";
    overlay.className = "ctc-add-overlay";
    overlay.style.cssText =
      "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;";
    const panel = document.createElement("div");
    panel.className = "ctc-add-panel";
    overlay.appendChild(panel);

    const h = document.createElement("div");
    h.className = "ctc-add-title";
    h.textContent = t("month_pick", lang);
    panel.appendChild(h);

    // Stato locale del selettore: l'anno mostrato nella griglia (cambia con le
    // frecce, non naviga la card finché non si sceglie un mese).
    let pickerYear = viewYear;
    const now = new Date();

    // Barra anno: ◀ 2026 ▶
    const yearBar = document.createElement("div");
    yearBar.className = "ctc-ypick-bar";
    const yPrev = document.createElement("button");
    yPrev.type = "button";
    yPrev.className = "ctc-month-nav";
    yPrev.innerHTML = `<ha-icon icon="mdi:chevron-left"></ha-icon>`;
    const yLabel = document.createElement("div");
    yLabel.className = "ctc-ypick-year";
    const yNext = document.createElement("button");
    yNext.type = "button";
    yNext.className = "ctc-month-nav";
    yNext.innerHTML = `<ha-icon icon="mdi:chevron-right"></ha-icon>`;
    yearBar.append(yPrev, yLabel, yNext);
    panel.appendChild(yearBar);

    // Griglia dei 12 mesi
    const mGrid = document.createElement("div");
    mGrid.className = "ctc-ypick-grid";
    panel.appendChild(mGrid);

    // Converte mese+anno scelti in _monthOffset e naviga
    const applyMonth = (year, month0) => {
      this._monthOffset = (year - now.getFullYear()) * 12 + (month0 - now.getMonth());
      overlay.remove();
      this._fetchAll();
    };

    // (Ri)disegna la griglia dei mesi per l'anno corrente del picker
    const renderMonths = () => {
      yLabel.textContent = String(pickerYear);
      mGrid.innerHTML = "";
      for (let m = 0; m < 12; m++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ctc-ypick-month";
        // Nome mese abbreviato localizzato (es. "gen", "feb")
        const name = new Date(2023, m, 1).toLocaleDateString(displayLocale, { month: "short" });
        btn.textContent = (name.charAt(0).toUpperCase() + name.slice(1)).replace(".", "");
        // Evidenzia il mese attualmente visualizzato nella card
        if (pickerYear === viewYear && m === viewMonth) btn.classList.add("ctc-ypick-current");
        // Evidenzia il mese reale di oggi
        if (pickerYear === now.getFullYear() && m === now.getMonth()) btn.classList.add("ctc-ypick-today");
        btn.addEventListener("click", () => applyMonth(pickerYear, m));
        mGrid.appendChild(btn);
      }
    };
    yPrev.addEventListener("click", () => { pickerYear--; renderMonths(); });
    yNext.addEventListener("click", () => { pickerYear++; renderMonths(); });
    renderMonths();

    // Azioni: solo Oggi · Annulla (la scelta del mese avviene cliccando la griglia)
    const actions = document.createElement("div");
    actions.className = "ctc-add-actions ctc-month-picker-actions";
    const btnToday = document.createElement("button");
    btnToday.type = "button";
    btnToday.className = "ctc-add-btn ctc-add-cancel";
    btnToday.textContent = t("month_today_btn", lang);
    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.className = "ctc-add-btn ctc-add-cancel";
    btnCancel.textContent = t("add_cancel", lang);
    actions.append(btnToday, btnCancel);
    panel.appendChild(actions);

    const close = () => overlay.remove();
    btnCancel.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    btnToday.addEventListener("click", () => {
      this._monthOffset = 0;
      close();
      this._fetchAll();
    });

    document.body.appendChild(overlay);
  }

  /* Applica sfondo trasparente o immagine di sfondo alla ha-card.
     Logica identica alla sun-weather-card, per coerenza tra le due card.
     Immagine e trasparenza sono mutuamente esclusive: se c'è un'immagine,
     ha la precedenza e la trasparenza viene ignorata. */
  // Supporto card-mod: la card ricostruisce lo shadow DOM ad ogni _render(),
  // il che cancella gli stili che card-mod aveva applicato. Per farlo funzionare,
  // dopo ogni render ri-applichiamo card-mod tramite l'API ufficiale
  // `applyToElement` (se card-mod è installato). Passiamo l'host della card
  // (`this`) con shadow=true: card-mod inietta lo <style> nello shadow root
  // della card, dove vive la <ha-card>, così un selettore `ha-card { }` (il caso
  // tipico) funziona come su una card standard.
  _applyCardMod() {
    const cfg = this._config && this._config.card_mod;
    if (!cfg) return;
    if (!window.customElements || !customElements.whenDefined) return;
    customElements.whenDefined("card-mod").then((cardMod) => {
      try {
        cardMod.applyToElement(
          this,                       // host della card (lo shadow contiene la ha-card)
          "card",                     // tipo: variabili di tema card-mod-card
          cfg,                        // { style, class, debug }
          { config: this._config },   // variabili per i template jinja
          true,                       // shadow: inietta nello shadow root dell'host
          "type-custom-calendar-tasks-card"
        );
      } catch (e) {
        // Versioni molto vecchie di card-mod con API diversa: ignora senza rompere
      }
    }).catch(() => { /* card-mod non installato: nessun problema */ });
  }

  _applyBackground(cardEl) {
    if (!cardEl) return;
    const bg = this._config.background_image;
    const hasBg = !!(bg && String(bg).trim());

    // Sfondo trasparente (solo se non c'è un'immagine)
    const wantTransparent = this._config.transparent === true && !hasBg;
    cardEl.classList.toggle("ctc-transparent", wantTransparent);

    // La trasparenza va applicata ANCHE come stile inline con !important:
    // gli stili inline battono qualsiasi foglio di stile, compresi i temi
    // "glass" che iniettano regole nella card (es. via card-mod). Senza questo
    // lo sfondo del tema resterebbe visibile e l'opzione sembrerebbe non funzionare.
    const forced = [
      ["background", "transparent"],
      ["background-color", "transparent"],
      ["background-image", "none"],
      ["box-shadow", "none"],
      ["border", "none"],
      ["backdrop-filter", "none"],
      ["-webkit-backdrop-filter", "none"],
      // variabili dei temi: ereditano anche dentro la shadow DOM di ha-card
      ["--ha-card-background", "transparent"],
      ["--card-background-color", "transparent"],
      ["--ha-card-box-shadow", "none"],
      ["--ha-card-border-width", "0"],
      ["--ha-card-border-color", "transparent"],
      ["--ha-card-backdrop-filter", "none"],
    ];
    if (wantTransparent) {
      forced.forEach(([p, v]) => cardEl.style.setProperty(p, v, "important"));
    } else {
      forced.forEach(([p]) => cardEl.style.removeProperty(p));
    }

    // Immagine di sfondo con velo incorporato, dipinta sulla card stessa
    if (hasBg) {
      cardEl.classList.add("ctc-has-bg-image");
      // Velo unico: da -1 (chiaro) a +1 (scuro), 0 = nessun velo
      let ov = Number(this._config.background_overlay);
      if (!isFinite(ov)) ov = 0;
      ov = Math.min(Math.max(ov, -1), 1);
      const dark = ov > 0;
      const op = Math.abs(ov);
      const veil = dark ? `rgba(0, 0, 0, ${op})` : `rgba(255, 255, 255, ${op})`;
      const bgUrl = String(bg).trim();
      cardEl.style.backgroundImage = `linear-gradient(${veil}, ${veil}), url("${bgUrl}")`;
      // Oltre una certa soglia di velo scuro, i testi vanno schiariti
      cardEl.classList.toggle("ctc-bg-dark", dark && op >= 0.4);
    } else {
      cardEl.classList.remove("ctc-has-bg-image", "ctc-bg-dark");
      cardEl.style.backgroundImage = "";
    }
  }

  /* Applica i filtri configurati ai dati grezzi e popola _events/_tasks.
     Filtro `exclude`: nasconde eventi/task con titolo che contiene una delle keyword.
     Match case-insensitive e parziale (sub-string). Una keyword vuota viene
     ignorata per sicurezza (non vogliamo nascondere tutto). */
  _applyFilters() {
    const rawEvents = this._eventsRaw || [];
    const rawTasks = this._tasksRaw || [];
    const ex = this._config?.exclude;
    // Normalizza: accetta array, stringa singola, o undefined
    const list = Array.isArray(ex) ? ex : (typeof ex === "string" && ex.trim() ? [ex] : []);
    if (list.length === 0) {
      this._events = rawEvents;
      this._tasks = rawTasks;
      return;
    }
    this._events = rawEvents.filter(ev => !isExcluded(ev.summary || ev.title, list));
    this._tasks = rawTasks.filter(task => !isExcluded(task.summary || task.title, list));
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

  // Risolve la vista EFFETTIVA (agenda vs griglia mensile).
  // Comportamento "sessione" (come Atomic Calendar Revive): il default è quello
  // di config (impostato dall'editor); il bottone nell'header cambia la vista
  // solo per la sessione corrente (variabile in memoria `_viewOverride`), senza
  // persistere. Alla ricostruzione della card (ricarica pagina, cambio scheda)
  // si torna al default. Nessuno storage, una sola fonte di verità = niente
  // casi limite.
  _resolveMonthView() {
    if (this._viewOverride === true) return true;
    if (this._viewOverride === false) return false;
    return this._config.month_view === true;
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
    // Pulsante "Cambia vista": alterna agenda ↔ griglia mensile senza passare
    // dall'editor. La scelta è per-dispositivo (localStorage) e persiste.
    const showViewSwitch = this._config.show_view_switch === true;
    if (showViewSwitch) {
      const inMonth = this._resolveMonthView();
      // Mostra l'icona della vista verso cui si passa
      const switchIcon = inMonth ? "mdi:view-agenda-outline" : "mdi:calendar-month-outline";
      const switchTitle = inMonth ? t("switch_to_agenda", lang) : t("switch_to_month", lang);
      headerActions += `<button class="ctc-header-btn" id="ctc-view-switch" title="${switchTitle}"><ha-icon icon="${switchIcon}"></ha-icon></button>`;
    }
    // Pulsante "Aggiungi": apre un form inline per creare un evento o un task.
    // Mostrato solo se attivato E se c'è almeno un calendario o una lista todo
    // (senza nessuno dei due non avrebbe dove creare).
    const showAddEvent = this._config.show_add_event === true
      && ((this._config.calendars || []).filter(isValidEntityId).length > 0
        || (this._config.todos || []).filter(isValidEntityId).length > 0);
    if (showAddEvent) {
      headerActions += `<button class="ctc-header-btn" id="ctc-add-event" title="${t("add_event", lang)}"><ha-icon icon="mdi:calendar-plus"></ha-icon></button>`;
    }
    if (showRefreshBtn) {
      headerActions += `<button class="ctc-header-btn" id="ctc-refresh" title="${t("refresh", lang)}"><ha-icon icon="mdi:refresh"></ha-icon></button>`;
    }
    if (showCollapseBtn) {
      headerActions += `<button class="ctc-header-btn ${isCollapsed ? "collapsed" : ""}" id="ctc-collapse-all" title="${isCollapsed ? t("expand_all", lang) : t("collapse_all", lang)}"><ha-icon icon="mdi:chevron-up" class="chevron"></ha-icon></button>`;
    }

    // Header: titolo + pulsanti. Se né titolo né pulsanti sono attivi, niente header.
    const titleText = this._config.title || t("agenda", lang);
    // Data corrente (opzionale, sotto il titolo). Segue la lingua/locale della card.
    const showCurrentDate = this._config.show_current_date === true;
    let currentDateHtml = "";
    if (showCurrentDate) {
      const todayStr = new Date().toLocaleDateString(displayLocale, {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      // Prima lettera maiuscola (alcuni locale danno il giorno minuscolo)
      const todayStrCap = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);
      currentDateHtml = `<span class="ctc-current-date">${todayStrCap}</span>`;
    }
    const hasHeader = this._config.show_title !== false || showCurrentDate || headerActions;
    const headerHtml = hasHeader ? `
      <div class="ctc-header">
        <span class="ctc-title-wrap">
          ${this._config.show_title !== false ? `<span class="ctc-title">${titleText}</span>` : ""}
          ${currentDateHtml}
        </span>
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
    // Sfondo trasparente / immagine di sfondo (applicato prima del contenuto,
    // così vale anche nello stato di caricamento e quando la card è collassata)
    this._applyBackground(cardElement);
    // Ri-applica card-mod (se installato) dopo la ricostruzione dello shadow DOM.
    this._applyCardMod();

    if (this._loading) {
      card.innerHTML += `<div class="ctc-loading"><ha-circular-progress active size="small"></ha-circular-progress></div>`;
      cardElement.appendChild(body);
      shadow.appendChild(cardElement);
      return;
    }

    // Vista a griglia mensile (alternativa all'agenda). Se attiva, riempio il
    // body con la griglia e salto la costruzione dell'agenda più sotto — ma NON
    // faccio return: il resto del render (append del body, aggancio degli
    // handler di header: aggiungi/refresh/collapse) deve comunque eseguire.
    const monthView = this._resolveMonthView();
    if (monthView) {
      body.appendChild(this._buildMonthGrid(displayLocale, firstDayOfWeek, lang, timeFormat));
    }
    const today = new Date();
    const todayKey = dayKey(today);
    const numDays = this._config.days || 7;

    // Widget meteo di oggi: costruito per ENTRAMBE le viste (agenda e griglia).
    // Si attacca a cardElement (la ha-card), sopra il body, quindi resta in
    // cima indipendentemente dalla vista scelta.
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

    // Tutta la costruzione dell'agenda va saltata in vista griglia mensile.
    if (!monthView) {

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

    // ── Ciclo per giorno: eventi + task ATTIVI con data ──
    for (let i = 0; i < numDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dk = dayKey(date);
      // Eventi del giorno. Se `multi_day_events` è attivo (default), un evento
      // che copre più giorni viene mostrato in TUTTI i giorni del suo intervallo,
      // non solo in quello di inizio. Salviamo su ogni evento la posizione nel
      // suo intervallo (_ctcDayIndex / _ctcTotalDays) per il contatore "(2/6)".
      const multiDayEnabled = this._config.multi_day_events !== false;
      const dayEvents = this._events.filter(ev => {
        if (multiDayEnabled) {
          const pos = getEventDayPosition(ev, date);
          if (!pos.inRange) return false;
          ev._ctcDayIndex = pos.dayIndex;
          ev._ctcTotalDays = pos.totalDays;
          return true;
        }
        // Comportamento classico: solo il giorno di inizio
        if (dayKey(parseEventDate(ev.start.dateTime || ev.start.date)) !== dk) return false;
        ev._ctcDayIndex = 1;
        ev._ctcTotalDays = 1;
        return true;
      });
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
          // Posizione dell'evento nel suo intervallo multi-giorno (impostata dal filtro).
          // dayIndex 1 = giorno di inizio, > 1 = prosecuzione dell'evento.
          const dayIndex = ev._ctcDayIndex || 1;
          const totalDays = ev._ctcTotalDays || 1;
          const isContinuation = totalDays > 1 && dayIndex > 1;
          const isLastDay = totalDays > 1 && dayIndex === totalDays;
          const s = fmtTimeFormatted(ev.start.dateTime, timeFormat, displayLocale);
          const e = this._config.show_end_time ? fmtTimeFormatted(ev.end?.dateTime, timeFormat, displayLocale) : null;
          const eAlways = fmtTimeFormatted(ev.end?.dateTime, timeFormat, displayLocale);
          // Orario per gli eventi multi-giorno con ora:
          //  - primo giorno  → "10:00 →"  (parte da qui)
          //  - ultimo giorno → "→ 12:00"  (arriva fin qui, ora di FINE)
          //  - giorni intermedi → "tutto il giorno"
          // La freccia distingue inizio da fine, così l'utente non confonde i due.
          let timeStr;
          if (allDay) {
            timeStr = t("all_day", lang);
          } else if (totalDays > 1) {
            if (dayIndex === 1) timeStr = `${s} →`;
            else if (isLastDay) timeStr = `→ ${eAlways}`;
            else timeStr = t("all_day", lang);
          } else {
            timeStr = e ? `${s}–${e}` : s;
          }
          // Contatore "(2/6)" accanto al titolo, come fanno Google e Apple Calendar
          const dayCounter = totalDays > 1
            ? `<span class="ctc-day-counter">(${dayIndex}/${totalDays})</span>` : "";
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
          // Tempo relativo "Manca X giorni" (per eventi è solo nel futuro, niente "scaduto").
          // Nei giorni di prosecuzione lo nascondiamo: "mancano 2 giorni" su un evento
          // già iniziato sarebbe fuorviante.
          let rel = "";
          if (this._config.show_relative_time && !isContinuation) {
            const evDate = parseEventDate(ev.start.dateTime || ev.start.date);
            const relText = formatRelativeTime(evDate, undefined, lang);
            if (relText) rel = `<div class="ctc-event-relative">${relText}</div>`;
          }
          return `<div class="ctc-event-row ctc-item" data-entity-id="${ev._source}"><div class="ctc-event-main"><div class="ctc-event-title">${ev.summary || "Evento"}${dayCounter}</div>${desc}${loc}${rel}${sub}</div><div class="ctc-event-time">${timeStr}</div></div>`;
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
    if (this._config.show_no_date !== false && undatedActive.length > 0) {
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

    } // fine if (!monthView): costruzione agenda
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
          // Calcolo l'altezza dei primi N giorni. Devo includere anche i banner
          // dei numeri di settimana (.ctc-week-banner) che compaiono TRA i giorni:
          // senza contarli, l'altezza risulta troppo corta e l'ultimo giorno
          // visibile viene tagliato quando "Mostra numero settimana" è attivo.
          let totalHeight = 0;
          const lastDay = dayRows[maxVisible - 1];
          // Sommo l'altezza di tutti gli elementi dall'inizio fino all'ultimo
          // giorno da mostrare compreso: così banner settimana e giorni sono
          // entrambi conteggiati, nell'ordine reale in cui appaiono.
          const bodyEl = lastDay ? lastDay.parentElement : null;
          if (bodyEl) {
            for (const child of bodyEl.children) {
              totalHeight += child.getBoundingClientRect().height;
              if (child === lastDay) break;
            }
          } else {
            // Fallback: solo i giorni (comportamento precedente)
            for (let i = 0; i < maxVisible; i++) {
              if (dayRows[i]) totalHeight += dayRows[i].getBoundingClientRect().height;
            }
          }
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

    // Pulsante "Aggiungi evento": apre il dialog nativo di HA (lo stesso della
    // tab Calendario). Non reimplementiamo nulla: lanciamo l'evento show-dialog
    // con il tag del dialog e i parametri. HA gestisce form, calendari
    // selezionabili, validazione e salvataggio. La card si aggiorna al refresh.
    const addEventBtn = shadow.getElementById("ctc-add-event");
    if (addEventBtn) {
      addEventBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      addEventBtn.addEventListener("pointerup", (e) => e.stopPropagation());
      addEventBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._openAddEventDialog();
      });
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

    // ── Bottone cambia vista (agenda ↔ mese) ──
    const viewSwitchBtn = shadow.getElementById("ctc-view-switch");
    if (viewSwitchBtn) {
      viewSwitchBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      viewSwitchBtn.addEventListener("pointerup", (e) => e.stopPropagation());
      viewSwitchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Cambio vista solo per la sessione corrente (non persiste): imposta
        // l'override in memoria, resetta il mese e rifà il fetch (_fetchAll
        // richiama _render() al termine).
        this._viewOverride = !this._resolveMonthView();
        this._monthOffset = 0;
        this._fetchAll();
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

  /* Restituisce la lingua corrente per i testi dell'editor.
     Usa la config esplicita (se impostata), altrimenti la lingua di HA. */
  _lang() {
    const hassLanguage = this._hass?.locale?.language || this._hass?.language || null;
    return resolveLanguage(this._config?.language, hassLanguage);
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
    // Propaga l'hass agli ha-form nativi montati nell'editor. Serve perché
    // set hass può arrivare DOPO il primo render: senza questo, un ha-form
    // costruito prima che hass fosse disponibile resterebbe vuoto.
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-form").forEach((f) => { f.hass = hass; });
    }
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

    // exclude: lista di keyword. Default è array vuoto [], che NON è uno scalar
    // (e quindi non viene gestito dal loop sopra). La includiamo solo se contiene
    // almeno una keyword valida, così non finisce mai nel YAML salvato se vuota.
    if (Array.isArray(config.exclude)) {
      const cleaned = config.exclude.filter(kw => kw != null && String(kw).trim().length > 0);
      if (cleaned.length > 0) {
        result.exclude = cleaned;
      }
    } else if (typeof config.exclude === "string" && config.exclude.trim().length > 0) {
      // Supporto anche stringa singola (per chi configura da YAML)
      result.exclude = [config.exclude.trim()];
    }

    // card_mod: non è un'opzione della card ma va preservata nel YAML, altrimenti
    // gli stili di card-mod verrebbero persi al salvataggio dall'editor.
    if (config.card_mod !== undefined) {
      result.card_mod = config.card_mod;
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
    selLbl.textContent = t("ed_action", this._lang());
    const sel = document.createElement("select");
    sel.className = "ctc-native-input wide";
    blockHAShortcuts(sel);
    const options = [
      { value: "none", text: t("ed_act_none", this._lang()) },
      { value: "more-info", text: t("ed_act_more_info", this._lang()) },
      { value: "toggle", text: t("ed_act_toggle", this._lang()) },
      { value: "navigate", text: t("ed_act_navigate", this._lang()) },
      { value: "url", text: t("ed_act_url", this._lang()) },
      { value: "call-service", text: t("ed_act_call_service", this._lang()) },
      { value: "assist", text: t("ed_act_assist", this._lang()) },
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

      if (a === "navigate") addParam(t("ed_param_path", this._lang()), c.navigation_path, "navigation_path", "/lovelace/home");
      else if (a === "url") addParam(t("ed_param_url", this._lang()), c.url_path, "url_path", "https://...");
      else if (a === "call-service") {
        addParam(t("ed_param_service", this._lang()), c.service, "service", "domain.service");
        // Per service_data accettiamo JSON
        const row = document.createElement("div");
        row.className = "field-row";
        const l = document.createElement("label");
        l.textContent = t("ed_data_json", this._lang());
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
      else if (a === "more-info" || a === "toggle") addParam(t("ed_param_entity", this._lang()), c.entity, "entity", "domain.entity");
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
    colorBtn.title = t("ed_choose_color", this._lang());
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
    autoBtn.title = t("ed_automatic", this._lang());
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

    // Risolvi la lingua per i testi dell'editor (es. label, placeholder, help)
    const hassLanguage = this._hass?.locale?.language || this._hass?.language || null;
    const lang = resolveLanguage(this._config?.language, hassLanguage);

    const root = document.createElement("div");
    root.className = "editor";

    // ── Entities (Calendars + Todo lists) ──
    // Open by default only on the very first installation (no entities configured yet)
    // so the user knows immediately where to add them.
    {
      const hasNoEntities = (this._config.calendars || []).length === 0
        && (this._config.todos || []).length === 0;
      const { wrapper, body } = this._makeCollapsible("entities", t("ed_entities", lang), hasNoEntities, "mdi:format-list-bulleted");

      // Sub-section: Calendars
      {
        const sub = this._makeCollapsible("entities-cal", t("ed_calendars", lang));
        const calList = document.createElement("div");
        calList.className = "entity-list";
        (this._config.calendars || []).forEach((id, i) => calList.appendChild(this._makeEntityRow("calendar", id, i)));
        sub.body.appendChild(calList);
        const addCal = document.createElement("button");
        addCal.className = "add-btn";
        addCal.innerHTML = `<ha-icon icon="mdi:plus"></ha-icon> ${t("ed_add_calendar", lang)}`;
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
        const sub = this._makeCollapsible("entities-todo", t("ed_todo_lists", lang));
        const todoList = document.createElement("div");
        todoList.className = "entity-list";
        (this._config.todos || []).forEach((id, i) => todoList.appendChild(this._makeEntityRow("todo", id, i)));
        sub.body.appendChild(todoList);
        const addTodo = document.createElement("button");
        addTodo.className = "add-btn";
        addTodo.innerHTML = `<ha-icon icon="mdi:plus"></ha-icon> ${t("ed_add_todo", lang)}`;
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
      const { wrapper, body } = this._makeCollapsible("header", t("ed_header", lang), false, "mdi:page-layout-header");

      body.appendChild(this._makeToggle(t("ed_show_title", lang), this._config.show_title !== false,
        v => { this._config.show_title = v; this._fire(); }));

      const rowTitle = document.createElement("div");
      rowTitle.className = "field-row";
      const lblTitle = document.createElement("label");
      lblTitle.textContent = t("ed_title", lang);
      const inpTitle = this._makeInput("inp-title", "text", this._config.title || "Agenda", "wide",
        v => { this._config.title = v; this._fire(); });
      rowTitle.append(lblTitle, inpTitle);
      body.appendChild(rowTitle);

      body.appendChild(this._makeToggle(t("ed_show_current_date", lang), this._config.show_current_date === true,
        v => { this._config.show_current_date = v; this._fire(); }));

      body.appendChild(this._makeToggle(t("ed_show_refresh", lang), this._config.show_refresh !== false,
        v => { this._config.show_refresh = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_add_event", lang), this._config.show_add_event === true,
        v => { this._config.show_add_event = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_collapse", lang), this._config.show_collapse_button !== false,
        v => { this._config.show_collapse_button = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_view_switch", lang), this._config.show_view_switch === true,
        v => { this._config.show_view_switch = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Layout ──
    {
      const { wrapper, body } = this._makeCollapsible("layout", t("ed_layout", lang), false, "mdi:view-dashboard-outline");

      // Vista griglia mensile (default della card; il bottone nell'header, se
      // attivo, può cambiarla temporaneamente per la sessione).
      body.appendChild(this._makeToggle(t("ed_month_view", lang), this._config.month_view === true,
        v => { this._config.month_view = v; this._fire(); }));

      // Giorni da mostrare (portata dell'agenda)
      const rowDays = document.createElement("div");
      rowDays.className = "field-row";
      const lblDays = document.createElement("label");
      lblDays.textContent = t("ed_days_to_show", lang);
      const inpDays = this._makeInput("inp-days", "number", this._config.days || 7, "narrow",
        v => { this._config.days = parseInt(v) || 7; this._fire(); });
      rowDays.append(lblDays, inpDays);
      body.appendChild(rowDays);

      // ── Limit events visible: toggle + numero condizionale ──
      const limitEnabled = this._config.limit_events_visible === true;
      const rowMaxEv = document.createElement("div");
      rowMaxEv.className = "field-row";
      rowMaxEv.style.display = limitEnabled ? "" : "none";
      rowMaxEv.style.paddingLeft = "16px";
      const lblMaxEv = document.createElement("label");
      lblMaxEv.textContent = t("ed_max_events_visible", lang);
      const inpMaxEv = this._makeInput("inp-maxev", "number",
        this._config.max_events_visible != null ? this._config.max_events_visible : 3, "narrow",
        v => {
          const n = parseInt(v);
          this._config.max_events_visible = isNaN(n) || n < 1 ? 1 : n;
          this._fire();
        });
      rowMaxEv.append(lblMaxEv, inpMaxEv);
      body.appendChild(this._makeToggle(t("ed_limit_events", lang), limitEnabled,
        v => {
          this._config.limit_events_visible = v;
          rowMaxEv.style.display = v ? "" : "none";
          this._fire();
        }));
      body.appendChild(rowMaxEv);

      // Numero settimana
      body.appendChild(this._makeToggle(t("ed_show_week_number", lang), !!this._config.show_week_number,
        v => { this._config.show_week_number = v; this._fire(); }));
      // Giorni vuoti
      body.appendChild(this._makeToggle(t("ed_show_empty_days", lang), !!this._config.show_empty_days,
        v => { this._config.show_empty_days = v; this._fire(); }));
      // Modalità compatta
      body.appendChild(this._makeToggle(t("ed_compact_mode", lang), this._config.compact_mode === true,
        v => { this._config.compact_mode = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Dettaglio evento ──
    {
      const { wrapper, body } = this._makeCollapsible("eventdetail", t("ed_event_detail", lang), false, "mdi:eye");

      body.appendChild(this._makeToggle(t("ed_show_end_time", lang), !!this._config.show_end_time,
        v => { this._config.show_end_time = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_multi_day_events", lang), this._config.multi_day_events !== false,
        v => { this._config.multi_day_events = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_relative_time", lang), this._config.show_relative_time !== false,
        v => { this._config.show_relative_time = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_source", lang), !!this._config.show_source,
        v => { this._config.show_source = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_description", lang), this._config.show_description !== false,
        v => { this._config.show_description = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_show_location", lang), !!this._config.show_location,
        v => { this._config.show_location = v; this._fire(); }));
      body.appendChild(this._makeToggle(t("ed_location_clickable", lang), !!this._config.location_clickable,
        v => { this._config.location_clickable = v; this._fire(); }));

      root.appendChild(wrapper);
    }
    {
      const { wrapper, body } = this._makeCollapsible("loc", t("ed_localization", lang), false, "mdi:translate");

      body.appendChild(this._makeSelect(t("ed_lang_label", lang),
        this._config.language || "auto",
        [
          { value: "auto", text: t("opt_system_default", lang) },
          { value: "it", text: "Italiano" },
          { value: "en", text: "English" },
          { value: "de", text: "Deutsch" },
          { value: "fr", text: "Français" },
        ],
        v => { this._config.language = v; this._fire(); }));

      body.appendChild(this._makeSelect(t("ed_time_format", lang),
        this._config.time_format || "auto",
        [
          { value: "auto", text: t("opt_system_default", lang) },
          { value: "24h", text: t("opt_24h", lang) },
          { value: "12h", text: t("opt_12h", lang) },
        ],
        v => { this._config.time_format = v; this._fire(); }));

      body.appendChild(this._makeSelect(t("ed_first_day", lang),
        this._config.first_day_of_week || "auto",
        [
          { value: "auto", text: t("opt_system_default", lang) },
          { value: "monday", text: t("opt_monday", lang) },
          { value: "sunday", text: t("opt_sunday", lang) },
          { value: "saturday", text: t("opt_saturday", lang) },
        ],
        v => { this._config.first_day_of_week = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Background ──
    {
      const { wrapper, body } = this._makeCollapsible("background", t("ed_background", lang), false, "mdi:image-outline");

      // Toggle sfondo trasparente
      body.appendChild(this._makeToggle(t("ed_transparent", lang), this._config.transparent === true,
        v => { this._config.transparent = v; this._fire(); }));

      // Campo immagine di sfondo
      const rowImg = document.createElement("div");
      rowImg.className = "field-row stacked";
      const lblImg = document.createElement("label");
      lblImg.textContent = t("ed_background_image", lang);
      const inpImg = this._makeInput("inp-bg-image", "text", this._config.background_image || "", "wide",
        v => { this._config.background_image = v.trim() || null; this._fire(); });
      inpImg.placeholder = "/local/bg.jpg";
      rowImg.append(lblImg, inpImg);
      body.appendChild(rowImg);

      // Slider del velo: da -1 (chiaro) a +1 (scuro), con tacca centrale sullo 0
      const ovWrap = document.createElement("div");
      ovWrap.style.cssText = "margin-top: 8px;";

      const ovLabel = document.createElement("div");
      ovLabel.style.cssText = "font-size: 13px; color: var(--ctc-text); margin-bottom: 6px;";
      ovLabel.textContent = t("ed_overlay", lang);

      const ovSliderWrap = document.createElement("div");
      ovSliderWrap.style.cssText = "position: relative; display: flex; align-items: center;";

      // Tacca verticale al centro, per trovare facilmente lo zero
      const ovTick = document.createElement("span");
      ovTick.style.cssText = `
        position: absolute; left: 50%; top: 50%;
        width: 2px; height: 16px; transform: translate(-50%, -50%);
        background: var(--ctc-text); opacity: 0.55;
        border-radius: 1px; pointer-events: none; z-index: 2;
      `;

      const ovInput = document.createElement("input");
      ovInput.type = "range";
      ovInput.min = "-1";
      ovInput.max = "1";
      ovInput.step = "0.05";
      ovInput.value = this._config.background_overlay ?? 0;
      ovInput.className = "ctc-overlay-slider";
      blockHAShortcuts(ovInput);
      ovInput.addEventListener("input", e => {
        this._config.background_overlay = Number(e.target.value);
        this._fire();
      });

      ovSliderWrap.append(ovTick, ovInput);

      // Etichette sotto lo slider: chiaro · 0 · scuro
      const ovScale = document.createElement("div");
      ovScale.style.cssText = "display: flex; justify-content: space-between; font-size: 11px; color: var(--ctc-muted); margin-top: 2px;";
      [t("ed_ov_lighter", lang), t("ed_ov_zero", lang), t("ed_ov_darker", lang)].forEach(txt => {
        const s = document.createElement("span");
        s.textContent = txt;
        ovScale.appendChild(s);
      });

      ovWrap.append(ovLabel, ovSliderWrap, ovScale);
      body.appendChild(ovWrap);

      root.appendChild(wrapper);
    }

    // ── Weather ──
    {
      const { wrapper, body } = this._makeCollapsible("weather", t("ed_weather", lang), false, "mdi:weather-partly-cloudy");

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
      lblEntity.textContent = t("ed_weather_entity", lang);

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
      subFields.appendChild(this._makeToggle(t("ed_show_weather_today", lang),
        this._config.show_weather_today !== false,
        v => { this._config.show_weather_today = v; this._fire(); }));

      // Toggle: mostra meteo per ogni giorno (sotto la data)
      subFields.appendChild(this._makeToggle(t("ed_show_weather_per_day", lang),
        this._config.show_weather_per_day === true,
        v => { this._config.show_weather_per_day = v; this._fire(); }));

      // Master toggle (in cima alla sezione)
      body.appendChild(this._makeToggle(t("ed_show_weather", lang), showWeather,
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
      const { wrapper, body } = this._makeCollapsible("tasks", t("ed_tasks", lang), false, "mdi:checkbox-marked-circle-outline");

      body.appendChild(this._makeToggle(t("ed_show_no_date", lang), this._config.show_no_date !== false,
        v => { this._config.show_no_date = v; this._fire(); }));

      body.appendChild(this._makeToggle(t("ed_show_overdue", lang), this._config.show_overdue !== false,
        v => { this._config.show_overdue = v; this._fire(); }));

      const rowOverdueDays = document.createElement("div");
      rowOverdueDays.className = "field-row";
      const lblOverdueDays = document.createElement("label");
      lblOverdueDays.textContent = t("ed_overdue_days", lang);
      const inpOverdueDays = this._makeInput("inp-overdue-days", "number", this._config.overdue_days != null ? this._config.overdue_days : 0, "narrow",
        v => {
          const n = parseInt(v);
          this._config.overdue_days = isNaN(n) || n < 0 ? 0 : n;
          this._fire();
        });
      rowOverdueDays.append(lblOverdueDays, inpOverdueDays);
      body.appendChild(rowOverdueDays);

      body.appendChild(this._makeToggle(t("ed_show_completed", lang), this._config.show_completed !== false,
        v => { this._config.show_completed = v; this._fire(); }));

      const rowCompletedDays = document.createElement("div");
      rowCompletedDays.className = "field-row";
      const lblCompletedDays = document.createElement("label");
      lblCompletedDays.textContent = t("ed_completed_days", lang);
      const inpCompletedDays = this._makeInput("inp-completed-days", "number", this._config.completed_days != null ? this._config.completed_days : 7, "narrow",
        v => {
          const n = parseInt(v);
          this._config.completed_days = isNaN(n) || n < 0 ? 7 : n;
          this._fire();
        });
      rowCompletedDays.append(lblCompletedDays, inpCompletedDays);
      body.appendChild(rowCompletedDays);

      body.appendChild(this._makeToggle(t("ed_allow_complete", lang), this._config.allow_complete !== false,
        v => { this._config.allow_complete = v; this._fire(); }));

      root.appendChild(wrapper);
    }

    // ── Filters ──
    {
      const { wrapper, body } = this._makeCollapsible("filters", t("ed_filters", lang), false, "mdi:filter-variant");

      // Stato locale: array di keyword corrente
      const getExcludeList = () => {
        const ex = this._config.exclude;
        if (Array.isArray(ex)) return [...ex];
        if (typeof ex === "string" && ex.trim().length > 0) return [ex];
        return [];
      };

      // Container per i chip delle keyword esistenti
      const chipsContainer = document.createElement("div");
      chipsContainer.style.display = "flex";
      chipsContainer.style.flexWrap = "wrap";
      chipsContainer.style.gap = "6px";
      chipsContainer.style.marginBottom = "8px";
      chipsContainer.style.minHeight = "24px";

      // Funzione di rendering dei chip
      const renderChips = () => {
        chipsContainer.innerHTML = "";
        const list = getExcludeList();
        list.forEach((kw, idx) => {
          const chip = document.createElement("span");
          chip.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: var(--secondary-background-color, rgba(0,0,0,0.05));
            border-radius: 16px;
            font-size: 13px;
            color: var(--ctc-text);
          `;
          chip.textContent = kw;
          // Pulsante "x" per rimuovere
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.textContent = "×";
          removeBtn.style.cssText = `
            border: none;
            background: transparent;
            color: var(--ctc-muted);
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            padding: 0;
            margin: 0;
            font-weight: bold;
          `;
          removeBtn.addEventListener("click", () => {
            const newList = getExcludeList();
            newList.splice(idx, 1);
            this._config.exclude = newList;
            renderChips();
            this._fire();
          });
          chip.appendChild(removeBtn);
          chipsContainer.appendChild(chip);
        });
      };

      // Riga input + bottone Aggiungi
      const inputRow = document.createElement("div");
      inputRow.style.display = "flex";
      inputRow.style.gap = "8px";
      inputRow.style.alignItems = "center";

      const inpKw = document.createElement("input");
      inpKw.type = "text";
      inpKw.className = "ctc-native-input";
      inpKw.style.flex = "1";
      inpKw.placeholder = t("exclude_placeholder", lang);
      blockHAShortcuts(inpKw);

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.textContent = t("exclude_add", lang);
      addBtn.style.cssText = `
        padding: 6px 14px;
        border-radius: 6px;
        border: 1px solid var(--ctc-border);
        background: var(--secondary-background-color, transparent);
        color: var(--ctc-text);
        cursor: pointer;
        font-size: 13px;
      `;

      const addKeyword = () => {
        const value = inpKw.value.trim();
        if (!value) return;
        const list = getExcludeList();
        // Evita duplicati (case-insensitive)
        if (list.some(kw => String(kw).toLowerCase() === value.toLowerCase())) {
          inpKw.value = "";
          return;
        }
        list.push(value);
        this._config.exclude = list;
        inpKw.value = "";
        renderChips();
        this._fire();
      };

      addBtn.addEventListener("click", addKeyword);
      inpKw.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          addKeyword();
        }
      });

      inputRow.append(inpKw, addBtn);

      // Etichetta + help text
      const labelDiv = document.createElement("div");
      labelDiv.style.cssText = "font-size: 13px; color: var(--ctc-text); margin-bottom: 8px;";
      labelDiv.textContent = t("exclude_keywords", lang);

      const helpDiv = document.createElement("div");
      helpDiv.style.cssText = "font-size: 11px; color: var(--ctc-muted); margin-top: 8px; line-height: 1.4;";
      helpDiv.textContent = t("exclude_help", lang);

      body.appendChild(labelDiv);
      body.appendChild(chipsContainer);
      body.appendChild(inputRow);
      body.appendChild(helpDiv);

      // Rendering iniziale
      renderChips();

      root.appendChild(wrapper);
    }

    // ── Interactions ──
    {
      const { wrapper, body } = this._makeCollapsible("inter", t("ed_interactions", lang), false, "mdi:gesture-tap");
      body.classList.add("inter-compact");
      body.appendChild(this._makeActionEditor(t("ed_tap", lang),
        this._config.tap_action,
        cfg => { this._config.tap_action = cfg; this._fire(); }));
      body.appendChild(this._makeActionEditor(t("ed_hold", lang),
        this._config.hold_action,
        cfg => { this._config.hold_action = cfg; this._fire(); }));
      body.appendChild(this._makeActionEditor(t("ed_double_tap", lang),
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
