import { useState } from 'react';
import { Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

const DEMOS = [
  { label: 'HR', email: 'hr@onboardly.com' },
  { label: 'Manager', email: 'manager@onboardly.com' },
  { label: 'Employee', email: 'aria@onboardly.com' },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <section className="login-art">
        <div className="brand"><Compass size={24} /> Bala's Onboarding</div>
        <div>
          <h1>The first 90 days, laid out step by step.</h1>
          <p>HR schedules the checklist, managers follow progress, and new hires always know what to do next.</p>
        </div>
        <ul className="login-points">
          <li>Checklists scheduled from each start date</li>
          <li>Role-based views for HR, managers and employees</li>
          <li>Overdue tasks surfaced before they slip</li>
        </ul>
      </section>

      <section className="login-form">
        <form onSubmit={submit} className="form">
          <h2>Sign in</h2>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

          <div className="demo">
            <span>Try a demo account (password: password123)</span>
            <div>
              {DEMOS.map((d) => (
                <button type="button" key={d.label} className="btn btn-ghost btn-sm" onClick={() => { setEmail(d.email); setPassword('password123'); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
