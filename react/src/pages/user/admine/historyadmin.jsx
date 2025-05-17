import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function Historyadmin() {
    const { idid_task } = useParams();
    const [historiques, setHistoriques] = useState([]);
    const [selectedId, setSelectedId] = useState(null);


  useEffect(() => {
    const fetchHistoriques = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/historiques`
        );
        const filteredData = response.data.filter(item => item.task_id == idid_task);
        
        setHistoriques(filteredData);
        
      } catch (error) {
        console.error('Error fetching historiques:', error);
      }
    };
    fetchHistoriques();
  }, [idid_task]);
  const handleRowClick = (histId) => {
    setSelectedId(selectedId === histId ? null : histId);
  };
  return (
    <div>
      <table className="history-table">
              <thead>
                <tr>
                  
                  <th>Description Preview</th>
                  <th>Change Date</th>
                </tr>
              </thead>
              <tbody>
                {historiques.slice().reverse().map((hist) => (
                  <React.Fragment key={hist.hist_id}>
                    <tr
                      className={`history-row ${selectedId === hist.hist_id ? 'selected' : ''}`}
                      onClick={() => handleRowClick(hist.hist_id)}
                    >
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
    </div>
  )
}
