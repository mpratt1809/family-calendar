export const CATEGORIES = [
  { id:"birthday",    label:"🎂 Birthday",      color:"#f87171", bg:"#fef2f2" },
  { id:"appointment", label:"🏥 Appointment",    color:"#60a5fa", bg:"#eff6ff" },
  { id:"vet",         label:"🐾 Vet / Pet Care", color:"#f472b6", bg:"#fdf2f8" },
  { id:"wfh",         label:"🏠 Work From Home", color:"#34d399", bg:"#ecfdf5" },
  { id:"errand",      label:"🛒 Errand / Task",  color:"#fb923c", bg:"#fff7ed" },
  { id:"holiday",     label:"🌴 Holiday",        color:"#facc15", bg:"#fefce8" },
  { id:"date",        label:"💛 Date Night",     color:"#c084fc", bg:"#faf5ff" },
  { id:"other",       label:"📌 Other",          color:"#94a3b8", bg:"#f8fafc" },
];

export const NOTE_CATS = [
  { id:"shopping", label:"🛒 Shopping",  color:"#fb923c" },
  { id:"pets",     label:"🐾 Pets",      color:"#f472b6" },
  { id:"home",     label:"🏠 Home",      color:"#34d399" },
  { id:"reminder", label:"⏰ Reminder",  color:"#60a5fa" },
  { id:"general",  label:"💬 General",   color:"#94a3b8" },
];

export const MEMBERS = ["Both of Us","Me","Sky","All Pets","Dogs","Cat"];

export const RECUR_LABELS = {
  none:"One-time", weekly:"Weekly", biweekly:"Every other week",
  monthly:"Monthly", bimonthly:"Every other month", yearly:"Yearly"
};

const today = new Date().toISOString().split("T")[0];

export const SEED_EVENTS = [
  { id:"e101", title:"🎂 My Birthday",           date:"2026-01-06", category:"birthday",    member:"Me",         recurring:"yearly",    notes:"" },
  { id:"e102", title:"🎂 Sky's Birthday",        date:"2026-02-18", category:"birthday",    member:"Sky",        recurring:"yearly",    notes:"Born 1993" },
  { id:"e201", title:"💊 Noodles Medicine",      date:"2026-03-22", category:"vet",         member:"Dogs",       recurring:"monthly",   notes:"Monthly medicine for Noodles" },
  { id:"e202", title:"💊 Tyde Medicine",         date:"2026-03-15", category:"vet",         member:"Dogs",       recurring:"monthly",   notes:"Monthly medicine for Tyde" },
  { id:"e203", title:"💊 Iko Medicine",          date:"2026-03-15", category:"vet",         member:"Dogs",       recurring:"monthly",   notes:"Monthly medicine for Iko" },
  { id:"e204", title:"💊 Peanut Medicine",       date:"2026-03-03", category:"vet",         member:"Cat",        recurring:"bimonthly", notes:"Every other month — Mar, May, Jul, Sep, Nov" },
  { id:"e301", title:"🧠 Therapy",               date:"2026-03-13", category:"appointment", member:"Me",         recurring:"biweekly",  notes:"Every other Friday" },
  { id:"e501", title:"🏠 Work From Home",        date:"2026-03-12", category:"wfh",         member:"Me",         recurring:"weekly",    notes:"Every Thursday" },
  { id:"e601", title:"🐕 Dog Sitting — Blue",   date:"2026-03-08", category:"vet",         member:"Both of Us", recurring:"none",      notes:"Day 1 of 4" },
  { id:"e602", title:"🐕 Dog Sitting — Blue",   date:"2026-03-09", category:"vet",         member:"Both of Us", recurring:"none",      notes:"Day 2 of 4" },
  { id:"e603", title:"🐕 Dog Sitting — Blue",   date:"2026-03-10", category:"vet",         member:"Both of Us", recurring:"none",      notes:"Day 3 of 4" },
  { id:"e604", title:"🐕 Dog Sitting — Blue",   date:"2026-03-11", category:"vet",         member:"Both of Us", recurring:"none",      notes:"Day 4 of 4 · Last day" },
  { id:"e605", title:"🐕 Dog Sitting — Blue (2nd Stay)", date:"2026-03-25", category:"vet", member:"Both of Us", recurring:"none",    notes:"Edit dates once confirmed" },
  { id:"e401", title:"🎤 Ashley Gavin Comedy",  date:"2026-03-20", category:"date",        member:"Both of Us", recurring:"none",      notes:"9:15 PM · Cap City Comedy Club, Austin TX · 2 tickets" },
  { id:"e402", title:"🎤 Amber Autry Comedy",   date:"2026-06-06", category:"date",        member:"Both of Us", recurring:"none",      notes:"7:00 PM 🎭" },
  { id:"h101", title:"🇺🇸 New Years Day",        date:"2026-01-01", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h102", title:"🇺🇸 MLK Day",             date:"2026-01-19", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h103", title:"❤️ Valentines Day",        date:"2026-02-14", category:"date",        member:"Both of Us", recurring:"none",      notes:"Plan something special! 💕" },
  { id:"h104", title:"🇺🇸 Presidents Day",       date:"2026-02-16", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h105", title:"☘️ St Patricks Day",       date:"2026-03-17", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h106", title:"🌸 Spring First Day",      date:"2026-03-20", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h107", title:"🐣 Easter",                date:"2026-04-05", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h108", title:"👩 Mothers Day",           date:"2026-05-10", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h109", title:"🇺🇸 Memorial Day",         date:"2026-05-25", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h110", title:"👨 Fathers Day",           date:"2026-06-21", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h111", title:"☀️ Summer First Day",      date:"2026-06-21", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h112", title:"🇺🇸 Independence Day",     date:"2026-07-04", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h113", title:"🇺🇸 Labor Day",            date:"2026-09-07", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h114", title:"🍂 Fall First Day",        date:"2026-09-23", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h115", title:"🎃 Halloween",             date:"2026-10-31", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h116", title:"🇺🇸 Veterans Day",         date:"2026-11-11", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h117", title:"🦃 Thanksgiving",          date:"2026-11-26", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h118", title:"🎄 Christmas Eve",         date:"2026-12-24", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h119", title:"🎄 Christmas Day",         date:"2026-12-25", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"" },
  { id:"h120", title:"🎆 New Years Eve",         date:"2026-12-31", category:"holiday",     member:"Both of Us", recurring:"none",      notes:"🥂" },
];
