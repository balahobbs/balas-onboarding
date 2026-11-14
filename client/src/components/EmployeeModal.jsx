import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import api, { errMsg } from '../api.js';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { toInputDate } from '../utils.js';

export default function EmployeeModal({ onSaved, onClose }) {
  const toast = useToast();
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'employee', department: '', jobTitle: '', startDate: toInputDate(new Date()), manager: '' });
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.get('/users/managers').then((r) => setManagers(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/users', form);
      setCreated(data);
      onSaved();
    } catch (err) {
      toast.error(errMsg(err));
      setSaving(false);
    }
  };

  if (created) {
    return (
      <Modal title={`${created.user.name} has been added`} onClose={onClose}>
        <div className="form">
          <p>
            {created.tasksCreated
              ? `${created.tasksCreated} onboarding tasks were scheduled from their start date.`
              : 'This account has no onboarding checklist.'}
          </p>
          <div className="cred">
            <div><span>Email</span><strong>{created.user.email}</strong></div>
            <div><span>Temporary password</span><strong>{created.tempPassword}</strong></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(`${created.user.email} / ${created.tempPassword}`); toast.success('Login details copied'); }}>
              <Copy size={16} /> Copy login details
            </button>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Add a new hire" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="grid-2">
          <label>Full name<input value={form.name} onChange={set('name')} required autoFocus /></label>
          <label>Work email<input type="email" value={form.email} onChange={set('email')} required /></label>
        </div>
        <div className="grid-2">
          <label>Job title<input value={form.jobTitle} onChange={set('jobTitle')} /></label>
          <label>Department<input value={form.department} onChange={set('department')} /></label>
        </div>
        <div className="grid-2">
          <label>Role
            <select value={form.role} onChange={set('role')}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </label>
          <label>Start date<input type="date" value={form.startDate} onChange={set('startDate')} required /></label>
        </div>
        {form.role === 'employee' && (
          <label>Reporting manager
            <select value={form.manager} onChange={set('manager')}>
              <option value="">No manager yet</option>
              {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </label>
        )}
        <p className="hint">New employees get the standard 12-task checklist, scheduled from their start date.</p>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>Add employee</button>
        </div>
      </form>
    </Modal>
  );
}
