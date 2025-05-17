import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './stylesres/History.css';

export default function History() {
  const navigate = useNavigate();
  const { id_task } = useParams();
  const [historiques, setHistoriques] = useState([]);
  const [newDescription, setNewDescription] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchHistoriques = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/historiques`
        );
        const filteredData = response.data.filter(item => item.task_id == id_task);
        
        setHistoriques(filteredData);
        
      } catch (error) {
        console.error('Error fetching historiques:', error);
      }
    };
    fetchHistoriques();
  }, [id_task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];

    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('description', newDescription);
    formData.append('task_id', id_task);
    
    // Fixed datetime format for MySQL
    const mysqlDateTime = new Date().toLocaleString('sv-SE').replace(' ', 'T');
    formData.append('change_date', mysqlDateTime);
    formData.append('dochistorique_path', file);

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/historiques', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(`'History created successfully!'${file}`);
      navigate('/app/Detail');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.response?.data?.message || 'History creation failed'}`);
    }
  };

  const handleRowClick = (histId) => {
    setSelectedId(selectedId === histId ? null : histId);
  };

  return (
    <div className="history-page">
      <h2>Task History {id_task}</h2>

      <div className="add-history-section">
        <h3>Add New History Entry</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Enter history description..."
            required
          />
          <div className="docs form-group">
            <label>Documentation*</label>
            <input
              type="file"
              id="fichier"
              name="fichier"
              accept=".pdf,.doc,.docx,.txt"
              required
              ref={fileInputRef}
            />
          </div>
          <button type="submit" className="add-button">
            Add History
          </button>
        </form>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description Preview</th>
            <th>Change Date</th>
          </tr>
        </thead>
        <tbody>
          {historiques.map((hist) => (
            <React.Fragment key={hist.hist_id}>
              <tr
                className={`history-row ${selectedId === hist.hist_id ? 'selected' : ''}`}
                onClick={() => handleRowClick(hist.hist_id)}
              >
                <td>{hist.hist_id}</td>
                <td>{hist.description.substring(0, 30)}...</td>
                <td>{new Date(hist.change_date).toLocaleString()}</td>
              </tr>
              
              {selectedId === hist.hist_id && (
                <tr className="expanded-row">
                  <td colSpan="3">
                    <div className="history-details">
                      <div className="detail-section">
                        <h4>Full Description:</h4>
                        <p>{hist.description}</p>
                      </div>
                      <div className="detail-section">
                        <h4>Attached Document:</h4>
                        {hist.dochistorique_path && (
                          <a
                            href={`http://localhost:8000/storage/${hist.dochistorique_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <Link to="/app/Detail" className="back-button">
        Back to Detail
      </Link>
    </div>
  );
}