import { useCallback, useEffect, useState } from 'react';
import { tasksApi, API_URL } from './api/tasks.js';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = useCallback(async () => {
    setError(null);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (payload) => {
    await tasksApi.create(payload);
    await loadTasks();
  };

  const handleUpdate = async (id, payload) => {
    await tasksApi.update(id, payload);
    setEditingTask(null);
    await loadTasks();
  };

  const handleDelete = async (id) => {
    await tasksApi.delete(id);
    if (editingTask?.id === id) setEditingTask(null);
    await loadTasks();
  };

  const handleToggleComplete = async (task) => {
    await tasksApi.update(task.id, { completed: !task.completed });
    await loadTasks();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Task Manager</h1>
        <p className="subtitle">
          React + Express + Supabase — deploy frontend on Vercel, API on Railway
        </p>
        {API_URL && (
          <p className="api-hint">
            API: <code>{API_URL}</code>
          </p>
        )}
      </header>

      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      <TaskForm
        key={editingTask ? editingTask.id : 'new'}
        editingTask={editingTask}
        onSubmit={editingTask ? (data) => handleUpdate(editingTask.id, data) : handleCreate}
        onCancel={() => setEditingTask(null)}
      />

      {loading ? (
        <p className="loading">Loading tasks…</p>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
}
