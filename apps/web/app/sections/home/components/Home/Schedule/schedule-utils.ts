import type { Event } from "@app";
import moment from "moment-timezone";

const TIMEZONE = "America/Chicago";

export function formatCardTime(startIso: string, endIso: string): string {
  const start = moment(startIso).tz(TIMEZONE);
  const end = moment(endIso).tz(TIMEZONE);
  return `${start.format("h:mma")} – ${end.format("h:mma")} CT`;
}

export function dayKey(iso: string): string {
  return moment(iso).tz(TIMEZONE).format("ddd M/D");
}

function parseDayKey(key: string): moment.Moment {
  const year = moment().tz(TIMEZONE).year();
  return moment.tz(`${key} ${year}`, "ddd M/D YYYY", TIMEZONE).startOf("day");
}

export function groupEventsByDay(events: Event[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};
  for (const evt of events) {
    const key = dayKey(evt.startTime);
    (grouped[key] ??= []).push(evt);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
  }
  return grouped;
}

export function orderDays(eventsByDay: Record<string, Event[]>): string[] {
  return Object.keys(eventsByDay).sort(
    (a, b) => parseDayKey(a).valueOf() - parseDayKey(b).valueOf()
  );
}

export function defaultActiveDay(orderedDays: string[]): string | null {
  if (orderedDays.length === 0) return null;

  const today = moment().tz(TIMEZONE);
  if (today.isBefore(parseDayKey(orderedDays[0]))) {
    return orderedDays[0];
  }

  const past = orderedDays.filter((key) =>
    today.isSameOrAfter(parseDayKey(key))
  );
  return past.length ? past[past.length - 1] : orderedDays[0];
}

export function splitDayKey(key: string): { day: string; date: string } {
  const parts = key.split(" ");
  if (parts.length < 2) return { day: key, date: "" };
  return { day: parts[0], date: parts[1] };
}
