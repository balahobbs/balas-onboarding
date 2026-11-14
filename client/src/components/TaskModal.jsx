import { useState } from 'react';
import api, { errMsg } from '../api.js';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CATEGORIES, toInputDate } from '../utils.js';

export default function TaskModal({ task, people, defaultAssignee, onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee?._id || defaultAssignee || people[0]?._id || '',
    category: task?.category || 'paperwork',
    priority: task?.priority || 'medium',
    dueDate: task ? toInputDate(task.dueDate) : toInputDate(new Date(Date.now() + 7 * 86400000)),
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = task ? await api.patch(`/tasks/${task._id}`, form) : await api.post('/tasks', form);
      toast.success(task ? 'Task updated' : 'Task created');
      onSaved(data);
    } catch (err) {
      toast.error(errMsg(err));
      setSaving(false);
    }
  };

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label>Title<input value={form.title} onChange={set('title')} required autoFocus /></label>
        <label>Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <label>Assign to
          <select value={form.assignee} onChange={set('assignee')} required>
            {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>
        <div className="grid-2">
          <label>Category
            <select value={form.category} onChange={set('category')}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label>Priority
            <select value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label>Due date<input type="date" value={form.dueDate} onChange={set('dueDate')} required /></label>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{task ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </Modal>
  );
}
