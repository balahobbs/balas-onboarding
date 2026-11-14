import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Avatar from '../components/Avatar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import Journey from '../components/Journey.jsx';
import TaskRow from '../components/TaskRow.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { fmtDate } from '../utils.js';

export default function EmployeeDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [modal, setModal] = useState(null);

  const load = () =>
    Promise.all([api.get(`/users/${id}`), api.get(`/tasks?assignee=${id}`)])
      .then(([u, t]) => { setPerson(u.data); setTasks(t.data); })
      .catch((e) => { toast.error(errMsg(e)); navigate('/people'); });

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (task, status) => {
    try {
      await api.patch(`/tasks/${task._id}`, { status });
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const removeTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success('Task deleted');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const removePerson = async () => {
    if (!window.confirm(`Remove ${person.name} and all of their tasks? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success(`${person.name} was removed`);
      navigate('/people');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (!person || !tasks) return <div className="loading">Loading…</div>;
  const { progress } = person;

  return (
    <>
      <Link to="/people" className="back"><ArrowLeft size={16} /> Back to {me.role === 'hr' ? 'new hires' : 'my team'}</Link>

      <section className="hero">
        <ProgressRing percent={progress.percent} size={124} stroke={11} />
        <div className="hero-main">
          <div className="person"><Avatar name={person.name} size={44} /><h1>{person.name}</h1></div>
          <p>{person.jobTitle || 'New hire'}{person.department ? ` · ${person.department}` : ''}</p>
          <p className="muted">
            Started {fmtDate(person.startDate)}
            {person.manager ? ` · Reports to ${person.manager.name}` : ''} · {progress.done} of {progress.total} tasks done
            {progress.overdue ? ` · ${progress.overdue} overdue` : ''}
          </p>
        </div>
        {me.role === 'hr' && (
          <button className="btn btn-ghost danger-btn" onClick={removePerson}><Trash2 size={16} /> Remove</button>
        )}
      </section>

      <section className="card">
        <h2>Onboarding path</h2>
        <Journey tasks={tasks} startDate={person.startDate} />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Tasks</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setModal({})}><Plus size={16} /> Add task</button>
        </div>
        {tasks.length ? (
          <ul className="tasks">
            {tasks.map((t) => <TaskRow key={t._id} task={t} canManage onStatus={changeStatus} onEdit={(task) => setModal({ task })} onDelete={removeTask} />)}
          </ul>
        ) : (
          <p className="empty">No tasks assigned yet.</p>
        )}
      </section>

      {modal && (
        <TaskModal task={modal.task} people={[person]} defaultAssignee={person._id} onSaved={() => { setModal(null); load(); }} onClose={() => setModal(null)} />
      )}
    </>
  );
}
