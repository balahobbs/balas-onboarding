import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Avatar from '../components/Avatar.jsx';
import EmployeeModal from '../components/EmployeeModal.jsx';
import { fmtDate } from '../utils.js';

export default function Employees() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, []);

  if (!users) return <div className="loading">Loading…</div>;
  const shown = users.filter((u) => `${u.name} ${u.email} ${u.jobTitle} ${u.department}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{user.role === 'hr' ? 'New hires' : 'My team'}</h1>
          <p className="muted">{users.length} {users.length === 1 ? 'person' : 'people'}</p>
        </div>
        {user.role === 'hr' && <button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={18} /> Add employee</button>}
      </header>

      <div className="toolbar">
        <label className="search"><Search size={16} /><input placeholder="Search by name, role or department" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      </div>

      <section className="card flush table-wrap">
        <table className="table">
          <thead>
            <tr><th>Person</th><th>Role</th><th>Department</th><th>Start date</th><th>Manager</th><th>Progress</th></tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u._id} className={u.role === 'employee' ? 'clickable' : ''} onClick={() => u.role === 'employee' && navigate(`/people/${u._id}`)}>
                <td>
                  <div className="person">
                    <Avatar name={u.name} />
                    <div><strong>{u.name}</strong><span className="muted block">{u.email}</span></div>
                  </div>
                </td>
                <td>{u.jobTitle || '-'}<span className="muted block">{u.role === 'employee' ? 'Employee' : u.role === 'hr' ? 'HR' : 'Manager'}</span></td>
                <td>{u.department || '-'}</td>
                <td>{fmtDate(u.startDate)}</td>
                <td>{u.manager?.name || '-'}</td>
                <td className="progress-cell">
                  {u.role === 'employee' ? (
                    <>
                      <div className="bar"><i style={{ width: `${u.progress.percent}%` }} /></div>
                      <span>{u.progress.done}/{u.progress.total}</span>
                    </>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="empty">No one matches that search.</p>}
      </section>

      {adding && <EmployeeModal onSaved={load} onClose={() => setAdding(false)} />}
    </>
  );
}
