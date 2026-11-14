import { Check } from 'lucide-react';
import { buildPhases, fmtShort } from '../utils.js';

// The signature element: onboarding drawn as a path with four milestones.
export default function Journey({ tasks, startDate }) {
  const phases = buildPhases(tasks, startDate);
  const currentIdx = phases.findIndex((p) => !p.complete);

  if (!phases.length) return <p className="empty">No tasks yet, so there is no path to show.</p>;

  return (
    <ol className="journey">
      {phases.map((p, i) => {
        const state = p.complete ? 'complete' : i === currentIdx ? 'current' : 'upcoming';
        return (
          <li key={p.key} className={`stop stop-${state}`}>
            <div className="stop-node">
              {p.complete ? <Check size={20} strokeWidth={3} /> : <span>{p.done}/{p.total}</span>}
            </div>
            <div className="stop-text">
              <strong>{p.label}</strong>
              <span>{p.complete ? 'All done' : `${p.total - p.done} left · by ${fmtShort(p.lastDue)}`}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
