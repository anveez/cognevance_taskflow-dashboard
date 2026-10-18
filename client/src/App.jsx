import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import Dashboard from './Dashboard.jsx';


function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const d = await api(`/auth/${mode}`, { method: 'POST', body: f });
      localStorage.setItem('token', d.token); onAuth(d.user);
    } catch (x) { setErr(x.message); }
  };
  return (
    <main className="auth">
      <h1>Taskflow</h1>
      <p className="sub">Plan the work, set the deadline, move it to done.</p>
      <form onSubmit={submit}>
        {mode === 'register' && <input placeholder="Name" value={f.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required minLength={6} />
        {err && <p className="err" role="alert">{err}</p>}
        <button className="primary">{mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
      </button>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);
  if (!ready) return null;
  return user ? <Dashboard user={user} onLogout={() => { localStorage.removeItem('token'); setUser(null); }} /> : <Auth onAuth={setUser} />;
}
