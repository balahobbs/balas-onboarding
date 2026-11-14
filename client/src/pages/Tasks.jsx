import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import TaskRow from '../components/TaskRow.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { isOverdue } from '../utils.js';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'done', label: 'Done' },
];

export default function Tasks() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = user.role !== 'employee';
  const [tasks, setTasks] = useState(null);
  const [people, setPeople] = useState([]);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [person, setPerson] = useState('');
  const [modal, setModal] = useState(null); // null | { task? }

  useEffect(() => {
    api.get('/tasks').then((r) => setTasks(r.data)).catch((e) => toast.error(errMsg(e)));
    if (canManage) api.get('/users?role=employee').then((r) => setPeople(r.data)).catch(() => {});
  }, []);

  const shown = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (tab === 'overdue' ? !isOverdue(t) : tab !== 'all' && t.status !== tab) return false;
      if (person && t.assignee?._id !== person) return false;
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tasks, tab, q, person]);

  const changeStatus = async (task, status) => {
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status });
      setTasks((ts) => ts.map((t) => (t._id === data._id ? data : t)));
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((ts) => ts.filter((t) => t._id !== task._id));
      toast.success('Task deleted');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const saved = (task) => {
    setTasks((ts) => (ts.some((t) => t._id === task._id) ? ts.map((t) => (t._id === task._id ? task : t)) : [...ts, task].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))));
    setModal(null);
  };

  if (!tasks) return <div className="loading">Loading…</div>;

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{canManage ? 'Tasks' : 'My tasks'}</h1>
          <p className="muted">{tasks.filter((t) => t.status !== 'done').length} open · {tasks.length} total</p>
        </div>
        {canManage && <button className="btn btn-primary" onClick={() => setModal({})} disabled={!people.length}><Plus size={18} /> New task</button>}
      </header>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <div className="filters">
          {canManage && (
            <select value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Filter by person">
              <option value="">Everyone</option>
              {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <label className="search"><Search size={16} /><input placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>
      </div>

      <section className="card flush">
        {shown.length ? (
          <ul className="tasks">
            {shown.map((t) => (
              <TaskRow key={t._id} task={t} onStatus={changeStatus} canManage={canManage} showAssignee={canManage} onEdit={(task) => setModal({ task })} onDelete={remove} />
            ))}
          </ul>
        ) : (
          <p className="empty">No tasks match these filters.</p>
        )}
      </section>

      {modal && <TaskModal task={modal.task} people={people} onSaved={saved} onClose={() => setModal(null)} />}
    </>
  );
}
