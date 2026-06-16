// Royal Ascot festival configuration. The leaderboard covers this window only.
export const FESTIVAL = {
  name: "Royal Ascot",
  startDay: "2026-06-16",
  endDay: "2026-06-20",
  // UTC offset for race times during the festival (June = British Summer Time, UTC+1).
  tzOffset: "+01:00",
  prizes: [250, 150, 100], // 1st / 2nd / 3rd, total £500
};

// Today's event day as a YYYY-MM-DD string (local clock).
export function todayDay() {
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const local = new Date(d.getTime() + off * 60000);
  return local.toISOString().slice(0, 10);
}

// Combine an event day + "HH:MM" race time into an absolute Date (BST).
export function raceOff(eventDay, time) {
  return new Date(`${eventDay}T${time}:00${FESTIVAL.tzOffset}`);
}

// Has a race's advertised start time passed? Picks lock at the off.
export function hasStarted(eventDay, time, now = new Date()) {
  return now >= raceOff(eventDay, time);
}

export function withinFestival(day) {
  return day >= FESTIVAL.startDay && day <= FESTIVAL.endDay;
}
