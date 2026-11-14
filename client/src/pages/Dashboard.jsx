import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, CheckCircle2, UserPlus } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import Journey from '../components/Journey.jsx';
import TaskRow from '../components/TaskRow.jsx';
import Avatar from '../components/Avatar.jsx';
import { fmtDate, isOverdue } from '../utils.js';

function Stat({ icon: Icon, label, value, tone = '' }) {
  return (
    <div className={`stat ${tone}`}>
      <Icon size={20} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState(null);
  const [stats, setStats] = useState(null);

  const refreshStats = () => api.get('/stats').then((r) => setStats(r.data));

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/stats')])
      .then(([t, s]) => {
        setTasks(t.data);
        setStats(s.data);
      })
      .catch((e) => toast.error(errMsg(e)));
  }, []);

  const changeStatus = async (task, status) => {
    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status });
      setTasks((ts) => ts.map((t) => (t._id === data._id ? data : t)));
      refreshStats();
      if (status === 'done') toast.success('Nice. Task completed.');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (!tasks || !stats) return <div className="loading">Loading…</div>;
  const first = user.name.split(' ')[0];
  const { totals } = stats;

  if (user.role === 'employee') {
    const upNext = tasks.filter((t) => t.status !== 'done').slice(0, 5);
    return (
      <>
        <section className="hero">
          <ProgressRing percent={totals.completion} size={148} stroke={13} />
          <div>
            <h1>Hi {first}, welcome aboard</h1>
            <p>
              You have finished {totals.done} of {totals.tasks} tasks
              {totals.overdue ? ` and ${totals.overdue} ${totals.overdue === 1 ? 'is' : 'are'} overdue.` : '. Nothing is overdue.'}
            </p>
            <p className="muted">
              Started {fmtDate(user.startDate)}
              {user.manager ? ` · Reporting to ${user.manager.name}` : ''}
            </p>
          </div>
        </section>

        <section className="card">
          <h2>Your onboarding path</h2>
          <Journey tasks={tasks} startDate={user.startDate} />
        </section>

        <section className="card">
          <h2>Up next</h2>
          {upNext.length ? (
            <ul className="tasks">{upNext.map((t) => <TaskRow key={t._id} task={t} onStatus={changeStatus} />)}</ul>
          ) : (
            <p className="empty">Everything is done. Enjoy the new role.</p>
          )}
          <Link to="/tasks" className="link">See all tasks</Link>
        </section>
      </>
    );
  }

  const late = tasks.filter(isOverdue).slice(0, 5);
  return (
    <>
      <header className="page-head">
        <div>
          <h1>{user.role === 'hr' ? 'Onboarding overview' : `Your team, ${first}`}</h1>
          <p className="muted">Progress across {stats.people.length} {stats.people.length === 1 ? 'new hire' : 'new hires'}</p>
        </div>
      </header>

      <div className="stats">
        <Stat icon={UserPlus} label="New hires" value={stats.people.length} />
        <Stat icon={CheckCircle2} label="Tasks completed" value={`${totals.completion}%`} tone="ok" />
        <Stat icon={AlertTriangle} label="Overdue" value={totals.overdue} tone={totals.overdue ? 'bad' : ''} />
        <Stat icon={CalendarClock} label="Due in 7 days" value={totals.dueSoon} />
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Needs attention</h2>
          {late.length ? (
            <ul className="tasks">{late.map((t) => <TaskRow key={t._id} task={t} onStatus={changeStatus} showAssignee />)}</ul>
          ) : (
            <p className="empty">No overdue tasks. Everyone is on track.</p>
          )}
        </section>

        <section className="card">
          <h2>Progress by person</h2>
          {stats.people.length ? (
            <ul className="people">
              {stats.people.map((p) => (
                <li key={p._id}>
                  <Link to={`/people/${p._id}`} className="person">
                    <Avatar name={p.name} />
                    <div className="person-main">
                      <div className="person-top"><strong>{p.name}</strong><span>{p.percent}%</span></div>
                      <div className="bar"><i style={{ width: `${p.percent}%` }} /></div>
                      <span className="muted">{p.jobTitle || 'New hire'} · started {fmtDate(p.startDate)}{p.overdue ? ` · ${p.overdue} overdue` : ''}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No new hires yet. Add one from the New hires page.</p>
          )}
        </section>
      </div>
    </>
  );
}
