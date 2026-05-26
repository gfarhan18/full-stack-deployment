export default function TaskList({ tasks, onEdit, onDelete, onToggleComplete }) {
  if (tasks.length === 0) {
    return (
      <section className="card empty-card">
        <p>No tasks yet. Create your first one above.</p>
      </section>
    );
  }

  return (
    <section className="card list-card">
      <h2>Your tasks ({tasks.length})</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'task task-done' : 'task'}>
            <label className="task-check">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task)}
                aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
              />
            </label>
            <div className="task-body">
              <h3>{task.title}</h3>
              {task.description ? <p>{task.description}</p> : null}
              <time dateTime={task.created_at}>
                {new Date(task.created_at).toLocaleString()}
              </time>
            </div>
            <div className="task-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Delete this task?')) onDelete(task.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
