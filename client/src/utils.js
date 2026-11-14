const DAY = 86400000;

export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtShort = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const toInputDate = (d) => new Date(d).toISOString().slice(0, 10);
export const initials = (name = '') => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const daysUntil = (d) => Math.round((new Date(d).setHours(0, 0, 0, 0) - startOfToday()) / DAY);
export const isOverdue = (t) => t.status !== 'done' && daysUntil(t.dueDate) < 0;

export function dueLabel(t) {
  if (t.status === 'done') return `Done ${t.completedAt ? fmtShort(t.completedAt) : ''}`.trim();
  const n = daysUntil(t.dueDate);
  if (n < 0) return `${Math.abs(n)} day${n === -1 ? '' : 's'} overdue`;
  if (n === 0) return 'Due today';
  if (n === 1) return 'Due tomorrow';
  if (n <= 7) return `Due in ${n} days`;
  return `Due ${fmtShort(t.dueDate)}`;
}

export const CATEGORIES = {
  paperwork: { label: 'Paperwork', color: '#5B6CC9' },
  'it-setup': { label: 'IT setup', color: '#0E7C7B' },
  training: { label: 'Training', color: '#B5651D' },
  'meet-the-team': { label: 'Meet the team', color: '#B8477A' },
  compliance: { label: 'Compliance', color: '#7A5BB5' },
  'check-in': { label: 'Check-in', color: '#2E9B6A' },
  growth: { label: 'Growth', color: '#C0841A' },
};

export const STATUS = {
  todo: { label: 'To do', next: 'in_progress' },
  in_progress: { label: 'In progress', next: 'done' },
  done: { label: 'Done', next: 'todo' },
};

// Group tasks into journey phases by how many days after the start date they are due.
export function buildPhases(tasks, startDate) {
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const defs = [
    { key: 'day1', label: 'First day', max: 1 },
    { key: 'week1', label: 'First week', max: 7 },
    { key: 'month1', label: 'First month', max: 30 },
    { key: 'day90', label: 'First 90 days', max: Infinity },
  ];
  const phases = defs.map((d) => ({ ...d, tasks: [] }));
  tasks.forEach((t) => {
    const offset = Math.round((new Date(t.dueDate).setHours(0, 0, 0, 0) - start) / DAY);
    phases.find((p) => offset <= p.max).tasks.push(t);
  });
  return phases
    .filter((p) => p.tasks.length)
    .map((p) => {
      const done = p.tasks.filter((t) => t.status === 'done').length;
      const lastDue = p.tasks.reduce((a, t) => (new Date(t.dueDate) > a ? new Date(t.dueDate) : a), new Date(0));
      return { ...p, done, total: p.tasks.length, complete: done === p.tasks.length, lastDue };
    });
}
