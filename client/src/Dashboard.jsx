import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import { TaskForm } from './TaskForm.jsx';

const STATUSES = [['todo', 'To do'], ['in-progress', 'In progress'], ['done', 'Done']];
const COLORS = { todo: '#8b7bff', 'in-progress': '#2dd4ff', done: '#34d399' };
const todayStr = () => new Date().toISOString().slice(0, 10);

function Donut({ counts, total }) {
  const R = 54, C = 2 * Math.PI * R; let off = 0;
  return (
    <svg viewBox="0 0 140 140" className="donut" role="img" aria-label="Tasks by status">
      <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line)" strokeWidth="14" />
      {STATUSES.map(([k], i) => {
        const len = total ? (counts[i] / total) * C : 0;
        const el = <circle key={k} cx="70" cy="70" r={R} fill="none" stroke={COLORS[k]} strokeWidth="14"
          strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />;
        off += len; return el;
      })}
      <text x="70" y="70" textAnchor="middle" className="big">{total ? Math.round((counts[2] / total) * 100) : 0}%</text>
      <text x="70" y="88" textAnchor="middle" className="small">complete</text>
    </svg>
  );
}

function Stat({ label, value, note, color }) {
  return (
    <div className="panel stat" style={{ '--c': color }}>
      <span>{label}</span><strong>{value}</strong><small>{note}</small>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [all, setAll] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '', overdue: false, sort: '-createdAt' });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => v && p.set(k, v));
    try {
      const [a, t] = await Promise.all([api('/tasks'), api('/tasks?' + p)]);
      setAll(a); setTasks(t);
    } catch (x) { setErr(x.message); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const save = async (f) => {
    try {
      const body = { ...f, deadline: f.deadline || null };
      editing === 'new' ? await api('/tasks', { method: 'POST', body }) : await api(`/tasks/${editing._id}`, { method: 'PUT', body });
      setEditing(null); load();
    } catch (x) { setErr(x.message); }
  };
  const setStatus = async (t, status) => { await api(`/tasks/${t._id}`, { method: 'PUT', body: { status } }); load(); };
  const remove = async (t) => { if (confirm(`Delete "${t.title}"?`)) { await api(`/tasks/${t._id}`, { method: 'DELETE' }); load(); } };

  const late = (t) => t.deadline && t.status !== 'done' && t.deadline.slice(0, 10) < todayStr();
  const counts = STATUSES.map(([s]) => all.filter((t) => t.status === s).length);
  const overdue = all.filter(late).length;
  const prio = ['high', 'medium', 'low'].map((p) => [p, all.filter((t) => t.priority === p).length]);
  const week = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), n: all.filter((t) => t.status !== 'done' && t.deadline?.slice(0, 10) === key).length };
  });
  const maxWeek = Math.max(1, ...week.map((w) => w.n));
  const f = (k) => (e) => setFilter({ ...filter, [k]: e.target.value });
  const nav = [['All tasks', {}], ['To do', { status: 'todo' }], ['In progress', { status: 'in-progress' }], ['Done', { status: 'done' }], ['Overdue', { overdue: true }]];
  const navActive = ([, v]) => (v.overdue ? filter.overdue : !filter.overdue && (v.status || '') === filter.status);

  return (
    <div className="app">
      <aside>
        <h1>Taskflow</h1>
        <nav>
          {nav.map(([l, v]) => (
            <button key={l} className={navActive([l, v]) ? 'on' : ''} onClick={() => setFilter({ ...filter, status: '', overdue: false, ...v })}>{l}</button>
          ))}
        </nav>
        <div className="me"><span>{user.name}</span><button className="link" onClick={onLogout}>Log out</button></div>
      </aside>

      <main>
        <div className="top">
          <input placeholder="Search tasks" value={filter.search} onChange={f('search')} aria-label="Search" />
          <select value={filter.priority} onChange={f('priority')} aria-label="Priority">
            <option value="">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
          <select value={filter.sort} onChange={f('sort')} aria-label="Sort">
            <option value="-createdAt">Newest first</option><option value="deadline">Nearest deadline</option>
          </select>
          <button className="primary" onClick={() => setEditing('new')}>New task</button>
        </div>

        {err && <p className="err" role="alert">{err}</p>}
        {editing && <TaskForm task={editing === 'new' ? null : editing} onSave={save} onCancel={() => setEditing(null)} />}

        <div className="stats">
          <Stat label="Total tasks" value={all.length} note="across all statuses" color="#8b7bff" />
          <Stat label="In progress" value={counts[1]} note="being worked on" color="#2dd4ff" />
          <Stat label="Completed" value={counts[2]} note={`${all.length ? Math.round((counts[2] / all.length) * 100) : 0}% of all tasks`} color="#34d399" />
          <Stat label="Overdue" value={overdue} note={overdue ? 'needs attention' : 'all on time'} color="#ff6b6b" />
        </div>

        <div className="charts">
          <section className="panel"><h2>Status</h2>
            <div className="donutwrap"><Donut counts={counts} total={all.length} />
              <ul className="legend">{STATUSES.map(([k, l], i) => <li key={k}><i style={{ background: COLORS[k] }} />{l}<b>{counts[i]}</b></li>)}</ul>
            </div>
          </section>
          <section className="panel"><h2>Due in the next 7 days</h2>
            <div className="bars">{week.map((w, i) => (
              <div key={i} className="bar"><b>{w.n || ''}</b><span style={{ height: `${(w.n / maxWeek) * 100}%` }} /><small>{w.label}</small></div>
            ))}</div>
          </section>
          <section className="panel"><h2>Priority</h2>
            {prio.map(([p, n]) => (
              <div key={p} className="hbar"><small>{p}</small><div><span className={`p-${p}`} style={{ width: `${all.length ? (n / all.length) * 100 : 0}%` }} /></div><b>{n}</b></div>
            ))}
          </section>
        </div>

        <div className="board">
          {STATUSES.map(([s, label]) => {
            const col = tasks.filter((t) => t.status === s);
            return (
              <section key={s} className="panel col">
                <h2><i style={{ background: COLORS[s] }} />{label}<small>{col.length}</small></h2>
                {col.map((t) => (
                  <article key={t._id} className={`card p-${t.priority}`}>
                    <h3>{t.title}</h3>
                    {t.description && <p>{t.description}</p>}
                    <div className="meta">
                      <span>{t.priority} priority</span>
                      {t.deadline && <span className={late(t) ? 'late' : ''}>{late(t) ? 'Overdue: ' : 'Due '}{new Date(t.deadline).toLocaleDateString()}</span>}
                    </div>
                    <div className="actions">
                      <select value={t.status} onChange={(e) => setStatus(t, e.target.value)} aria-label="Move to">
                        {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button className="link" onClick={() => setEditing(t)}>Edit</button>
                      <button className="link danger" onClick={() => remove(t)}>Delete</button>
                    </div>
                  </article>
                ))}
                {!col.length && <p className="empty">Nothing here. Add a task or change the filters.</p>}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
