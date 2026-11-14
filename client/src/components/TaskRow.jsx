import { Check, Pencil, Trash2, Flag } from 'lucide-react';
import { CATEGORIES, STATUS, dueLabel, isOverdue } from '../utils.js';
import Avatar from './Avatar.jsx';

export default function TaskRow({ task, onStatus, onEdit, onDelete, canManage, showAssignee }) {
  const cat = CATEGORIES[task.category] || CATEGORIES.paperwork;
  const done = task.status === 'done';
  const overdue = isOverdue(task);

  return (
    <li className={`task ${done ? 'task-done' : ''}`}>
      <button
        className={`check ${done ? 'check-on' : ''}`}
        onClick={() => onStatus(task, done ? 'todo' : 'done')}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      >
        {done && <Check size={14} strokeWidth={3} />}
      </button>

      <div className="task-main">
        <div className="task-title">{task.title}</div>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className="chip" style={{ '--chip': cat.color }}>{cat.label}</span>
          {task.priority === 'high' && !done && (
            <span className="prio"><Flag size={13} /> High priority</span>
          )}
          {showAssignee && task.assignee && (
            <span className="who"><Avatar name={task.assignee.name} size={18} /> {task.assignee.name}</span>
          )}
        </div>
      </div>

      <div className="task-side">
        <span className={`due ${overdue ? 'due-late' : ''}`}>{dueLabel(task)}</span>
        {!done && (
          <button className={`pill pill-${task.status}`} onClick={() => onStatus(task, STATUS[task.status].next)}>
            {STATUS[task.status].label}
          </button>
        )}
        {canManage && (
          <span className="task-actions">
            <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={16} /></button>
            <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Delete task"><Trash2 size={16} /></button>
          </span>
        )}
      </div>
    </li>
  );
}
