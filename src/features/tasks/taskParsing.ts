import type { Task } from "@/context/TasksContext";

export function parseQuickTask(input: string): Partial<Task> & { title: string } {
  // Examples:
  // "Call mom tomorrow #family !high 30m"
  // "Finish report 2026-01-30 !low"
  const raw = input.trim();
  let title = raw;

  const out: any = {};

  // priority tokens: !low !medium !high
  const pr = raw.match(/\!(low|medium|high)\b/i);
  if (pr) {
    out.priority = pr[1].toLowerCase();
    title = title.replace(pr[0], "").trim();
  }

  // duration tokens: 25m, 1h, 1h30m
  const dur = raw.match(/\b(\d+)h(?:(\d{1,2})m)?\b|\b(\d+)m\b/i);
  if (dur) {
    let minutes = 0;
    if (dur[1]) {
      minutes += parseInt(dur[1], 10) * 60;
      if (dur[2]) minutes += parseInt(dur[2], 10);
      title = title.replace(dur[0], "").trim();
    } else if (dur[3]) {
      minutes += parseInt(dur[3], 10);
      title = title.replace(dur[0], "").trim();
    }
    out.duration = minutes;
  }

  // simple due date parsing: yyyy-mm-dd, today, tomorrow
  const today = new Date();
  const iso = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) {
    out.due_date = iso[1];
    title = title.replace(iso[0], "").trim();
  } else if (/\btomorrow\b/i.test(raw)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    out.due_date = d.toISOString().slice(0, 10);
    title = title.replace(/\btomorrow\b/i, "").trim();
  } else if (/\btoday\b/i.test(raw)) {
    out.due_date = today.toISOString().slice(0, 10);
    title = title.replace(/\btoday\b/i, "").trim();
  }

  // category token: #something (stored in description hint; mapping is done in UI if desired)
  const cat = raw.match(/\#([\w-]{2,30})\b/);
  if (cat) {
    out.description = (out.description ? out.description + " " : "") + `#${cat[1]}`;
    title = title.replace(cat[0], "").trim();
  }

  // default priority
  if (!out.priority) out.priority = "medium";

  // final title
  title = title.replace(/\s+/g, " ").trim();
  return { title: title || raw, ...out };
}
