import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/DivisionManagement.css';

const apiUrl = 'http://127.0.0.1:8000/api/v1';

export default function AdminDivisions() {
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [modalTasks, setModalTasks] = useState(null);
  const [form, setForm] = useState({ name: '', responsable: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Column-specific filter states
  const [filterName, setFilterName] = useState('');
  const [filterResp, setFilterResp] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Load divisions, tasks, statuses
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [divRes, taskRes, statusRes] = await Promise.all([
          axios.get(`${apiUrl}/divisions`),
          axios.get(`${apiUrl}/tasks`),
          axios.get(`${apiUrl}/statuses`)
        ]);
        setDivisions(divRes.data);
        setAllTasks(taskRes.data);
        setAllStatuses(statusRes.data);
        setError('');
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load divisions, tasks, or statuses');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Apply filters whenever data or filter values change
  useEffect(() => {
    let result = divisions;

    if (filterName.trim()) {
      const q = filterName.toLowerCase();
      result = result.filter(d => d.division_nom.toLowerCase().includes(q));
    }

    if (filterResp.trim()) {
      const q = filterResp.toLowerCase();
      result = result.filter(d => d.division_responsable.toLowerCase().includes(q));
    }

    if (filterStatus) {
      result = result.filter(div =>
        allTasks
          .filter(t => t.division_id === div.division_id)
          .some(t =>
            allStatuses
              .filter(s => s.task_id === t.task_id)
              .some(s => s.statut === filterStatus)
          )
      );
    }

    setFilteredDivisions(result);
  }, [divisions, allTasks, allStatuses, filterName, filterResp, filterStatus]);

  // Open tasks modal for a division
  const openTasks = (div) => {
    const tasks = allTasks.filter(t => t.division_id === div.division_id);
    const tasksWithStates = tasks.map(t => ({
      ...t,
      states: allStatuses.filter(s => s.task_id === t.task_id)
    }));
    setModalTasks({ divisionName: div.division_nom, tasks: tasksWithStates });
  };

  const closeModal = () => setModalTasks(null);

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Add or update division
  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        division_nom: form.name,
        division_responsable: form.responsable,
        password: form.password
      };

      if (editingId) {
        await axios.put(`${apiUrl}/divisions/${editingId}`, payload);
      } else {
        await axios.post(`${apiUrl}/divisions`, payload);
      }

      setForm({ name: '', responsable: '', password: '' });
      setEditingId(null);
      const divRes = await axios.get(`${apiUrl}/divisions`);
      setDivisions(divRes.data);
      setError('');
    } catch (err) {
      console.error('Error saving division:', err);
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  // Populate form for editing
  const startEdit = (div) => {
    setForm({
      name: div.division_nom,
      responsable: div.division_responsable,
      password: div.password
    });
    setEditingId(div.division_id);
  };

  // Unique status options
  const uniqueStatuses = [...new Set(allStatuses.map(s => s.statut))];

  return (
    <div className="admin-divisions">
      <h1>Division Management</h1>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-indicator">Loading...</div>}

      {/* Column Filters */}
      <div className="column-filters">
        <input
          type="text"
          placeholder="Filter Name"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter Responsible"
          value={filterResp}
          onChange={e => setFilterResp(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Add / Edit Form */}
      <form className="division-form" onSubmit={handleAddOrEdit}>
        <input
          name="name"
          placeholder="Division Name"
          value={form.name}
          onChange={handleFormChange}
          required
        />
        <input
          name="responsable"
          placeholder="Responsible Person"
          value={form.responsable}
          onChange={handleFormChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleFormChange}
          required
          autoComplete="current-password"
        />
        <div className="form-buttons">
          <button type="submit" className="submit-button">
            {editingId ? 'Update' : 'Add'} Division
          </button>
          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: '', responsable: '', password: '' });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Divisions Table */}
      <div className="table-container">
        <table className="division-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Responsible</th>
              <th>Password</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDivisions.map(div => (
              <tr key={div.division_id}>
                <td>{div.division_nom}</td>
                <td>{div.division_responsable}</td>
                <td>{div.password}</td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => openTasks(div)}
                  >
                    View Tasks ({allTasks.filter(t => t.division_id === div.division_id).length})
                  </button>
                </td>
                <td>
                  <button className="edit-button" onClick={() => startEdit(div)}>
                    Edit
                  </button>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tasks Modal */}
      {modalTasks && (
        <div className="division-tasks-modal-backdrop" onClick={closeModal}>
          <div className="division-tasks-modal-content" onClick={e => e.stopPropagation()}>
            <div className="division-tasks-modal-header">
              <h2>Tasks for {modalTasks.divisionName}</h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <div className="division-tasks-modal-body">
              {modalTasks.tasks.length === 0 ? (
                <div className="division-no-tasks">No tasks found for this division</div>
              ) : (
                <table className="division-tasks-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Description</th>
                      <th>Due Date</th>
                      <th>Finish Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalTasks.tasks.map(task => {
                      const lastState = task.states[task.states.length - 1];
                      return (
                        <tr key={task.task_id}>
                          <td>{task.task_name}</td>
                          <td>{task.description || '-'}</td>
                          <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                          <td>{task.fin_date ? new Date(task.fin_date).toLocaleDateString() : '-'}</td>
                          <td>
                            {lastState ? (
                              <span className={`status-badge ${lastState.statut.toLowerCase().replace(/\s+/g, '_')}`}>
                                {lastState.statut}
                              </span>
                            ) : (
                              <span className="no-status">En attente</span>
                            )}
                          </td>
                          <td>
                            <button className="history-button">
                              <Link to={`/app/HistoryAdmin/${task.task_id}`}>View history</Link>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
