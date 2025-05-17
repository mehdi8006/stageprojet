import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import * as Iconsio5 from 'react-icons/io5';
import * as icontb from 'react-icons/tb';

const AddDivisionTask = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    divisionIds: [],
  });

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/v1/divisions') // Fetch divisions
      .then(response => {
        if (response.data && response.data.length > 0) {
          setDivisions(response.data); // Update state with fetched divisions
        }
      })
      .catch(error => {
        console.error('Error fetching division data:', error);
      });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleDivisionSelect = (divId) => {
    setFormData(prev => ({
      ...prev,
      divisionIds: prev.divisionIds.includes(divId) 
        ? [] // Deselect if already selected
        : [divId] // Select only the clicked division
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    setIsSaving(true);
    if (formData.divisionIds.length === 0) {
      alert("Please select at least one division.");
      return;
    }
  
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    
    if (!file) {
      alert("Please select a document file.");
      return;
    }
  
    const today = new Date().toISOString().split('T')[0];
    const payload = new FormData();
    payload.append('task_name', formData.title);
    payload.append('description', formData.description);
    payload.append('due_date', formData.startDate);
    payload.append('fin_date', formData.endDate);
    payload.append('division_id', formData.divisionIds[0]);
  
    axios.post('http://127.0.0.1:8000/api/v1/tasks', payload)
      .then(response => {
        const taskId = response.data.data.task_id;
  
        // Create status
        return axios.post('http://127.0.0.1:8000/api/v1/statuses', {
          task_id: taskId,
          statut: 'En attente',
          date_changed: today,
        })
        .then(() => taskId);
      })
      .then(taskId => {
        // Create document path with the actual file
        const docPayload = new FormData();
        docPayload.append('document_path', file);  // Using the expected field name
        docPayload.append('task_id', taskId);
  
        return axios.post('http://127.0.0.1:8000/api/v1/documentpaths', docPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      })
      .then(() => {
        alert(`Task created successfully!`);
        navigate('/app');
      })
      .catch(error => {
        console.error('Error:', error.response?.data || error.message);
        alert(`Error: ${error.response?.data?.message || 'Task creation failed'}`);
      })
      .finally(() => {
        setIsSaving(false);
      });;
  };

  return (
    <div className="add-task-container">
      <div className="page-header">
        <h1>
          <icontb.TbListDetails className="header-icon" />
          Ajouter une tâche pour la division
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-section">
          <h2>Détails de la tâche</h2>
          <div className="form-group">
            <label>Titre*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Entrez le titre de la tâche"
            />
          </div>
          <div className="form-group">
            <label>Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Décrivez la tâche en détail"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Division Assignment</h2>
          <div className="form-group">
            <label>Select Division(s)*</label>
            <div className="division-selector">
              {divisions.map((div) => (
                <div
                  key={div.division_id}
                  className={`division-tag ${
                    formData.divisionIds.includes(div.division_id) ? 'selected' : ''
                  }`}
                  onClick={() => handleDivisionSelect(div.division_id)}
                >
                  {div.division_nom}
                  {formData.divisionIds.includes(div.division_id) && (
                    <>
                      <Iconsio5.IoCheckmark className="check-icon" />
                      <span className="responsable-badge">
                        {div.division_responsable}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* Validation Error Message */}
            
          </div>
        </div>

        <div className="form-section">
          <h2>Task Timeline</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>End Date*</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        <div className='docs form-group'>
          <label>Documentation*</label>
          <input type="file" id="file" name="file" accept=".pdf,.doc,.docx,.txt" required/>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/Taches')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSaving} >
            <Iconsio5.IoSaveOutline className="btn-icon" />
            {isSaving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDivisionTask;
