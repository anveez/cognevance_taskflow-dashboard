import { useState } from 'react';
export function TaskForm({ task, onSave, onCancel }) {
  const [f, setF] = useState({
    title: task?.title || '', description: task?.description || '',
    priority: task?.priority || 'medium', deadline: task?.deadline?.slice(0, 10) || '',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="taskform" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <input placeholder="What needs doing?" value={f.title} onChange={set('title')} required maxLength={120} autoFocus />
      <textarea placeholder="Details (optional)" value={f.description} onChange={set('description')} rows={2} />
      <div className="row">
        <select value={f.priority} onChange={set('priority')} aria-label="Priority">
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <input type="date" value={f.deadline} onChange={set('deadline')} aria-label="Deadline" />
        <button className="primary">{task ? 'Save changes' : 'Add task'}</button>
        <button type="button" className="link" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

