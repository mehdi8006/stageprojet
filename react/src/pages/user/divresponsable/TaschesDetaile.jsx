import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './stylesres/TachesDetaile.css';

export default function TaschesDetaile({ user }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const apiUrl = 'http://127.0.0.1:8000/api/v1';
  const statusOptions = ['En attente', 'En cours', 'Terminé', 'Annulé'];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const [tasksRes, statusesRes] = await Promise.all([
          axios.get(`${apiUrl}/tasks`),
          axios.get(`${apiUrl}/statuses`)
        ]);

        const tasksWithStatus = tasksRes.data
          .filter(task => task.division_id === user.division_id)
          .map(task => {
            const taskStatuses = statusesRes.data
              .filter(status => status.task_id === task.task_id)
              .sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));
            
            const latestStatus = taskStatuses[0]?.statut || 'En attente';

            return {
              ...task,
              status: latestStatus,
              statusHistory: taskStatuses
            };
          });

        setTasks(tasksWithStatus);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user.division_id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedTask) return;
    
    setIsUpdating(true);
    setError(null);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Update status using PUT
      await axios.put(`${apiUrl}/statuses/${selectedTask.task_id}`, {
        task_id: selectedTask.task_id,
        statut: newStatus,
        date_changed: today,
      });

      // If status is "terminé", update finish date
      if (newStatus === 'terminé') {
        await axios.patch(`${apiUrl}/tasks/${selectedTask.task_id}`, {
          fin_date: today
        });
      }

      // Refresh task data
      const [taskRes, statusesRes] = await Promise.all([
        axios.get(`${apiUrl}/tasks/${selectedTask.task_id}`),
        axios.get(`${apiUrl}/statuses?task_id=${selectedTask.task_id}`)
      ]);

      const updatedTask = {
        ...taskRes.data,
        status: newStatus,
        statusHistory: statusesRes.data.sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed))
      };

      // Update state
      setTasks(prev => prev.map(t => 
        t.task_id === selectedTask.task_id ? updatedTask : t
      ));
      setSelectedTask(updatedTask);
      setNewStatus('');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Status</th>
            <th>Finish Date</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.task_id}>
              <td>{task.task_name}</td>
              <td>
                <span className={`status-badge status-${task.status.replace(/\s+/g,'-')}`}>
                  {task.status}
                </span>
              </td>
              <td className="date-cell">
                {task.fin_date ? new Date(task.fin_date).toLocaleDateString() : '-'}
              </td>
              <td className="date-cell">
                {new Date(task.due_date).toLocaleDateString()}
              </td>
              <td>
                <button 
                  className="action-btn btn-details"
                  onClick={() => {
                    setSelectedTask(task);
                    setNewStatus('');
                    setError(null);
                  }}
                >
                  Modifier statu
                </button>
                <button className="action-btn btn-history">
                  <Link to={`/app/History/${task.task_id}`}>Historique</Link>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask.task_name}</h2>
              <button className="close-button" onClick={() => setSelectedTask(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}
              
              <div className="detail-row">
                <span className="detail-label">Statut actuel :</span>
                <span className={`status-badge status-${selectedTask.status.replace(/\s+/g, '-')}`}>
                  {selectedTask.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Update Status:</span>
                <div className="status-update-container">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="status-select"
                    disabled={isUpdating}
                  >
                    <option value="">Select new status</option>
                    {statusOptions
                      .filter(option => option !== selectedTask.status)
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || isUpdating}
                    className="update-status-btn"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span className="detail-label">Due Date:</span>
                <span className="date-value">
                  {new Date(selectedTask.due_date).toLocaleDateString()}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Finish Date:</span>
                <span className="date-value">
                  {selectedTask.fin_date 
                    ? new Date(selectedTask.fin_date).toLocaleDateString()
                    : 'Not completed'}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Description :</span>
                <p className="task-description">
                  {selectedTask.description || 'Aucune description disponible'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}