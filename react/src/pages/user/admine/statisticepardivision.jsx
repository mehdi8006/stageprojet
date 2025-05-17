import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const apiUrl = 'http://127.0.0.1:8000/api/v1';

const Statisticepardivision = () => {
    const { iddiv } = useParams();
  const [divisionData, setDivisionData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch division data (example for division ID 1)
        const divisionRes = await axios.get(`${apiUrl}/divisions/${iddiv}`);
        setDivisionData(divisionRes.data);

        // Fetch all tasks and filter by division
        const tasksRes = await axios.get(`${apiUrl}/tasks`);
        const divisionTasks = tasksRes.data.filter(task => task.division_id == iddiv);
        setTasks(divisionTasks);

        // Fetch related data
        const [statusesRes, documentsRes] = await Promise.all([
          axios.get(`${apiUrl}/statuses`),
          axios.get(`${apiUrl}/documentpaths`)
        ]);

        // Process statuses
        const taskIds = divisionTasks.map(task => task.task_id);
        const filteredStatuses = statusesRes.data.filter(status => 
          taskIds.includes(status.task_id)
        );

        // Calculate status counts
        const tasksWithLatestStatus = divisionTasks.map(task => {
          const taskStatuses = filteredStatuses
            .filter(s => s.task_id === task.task_id)
            .sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));
          return {
            ...task,
            latestStatus: taskStatuses[0]?.statut || 'En attente'
          };
        });

        const statusCounts = tasksWithLatestStatus.reduce((acc, task) => {
          acc[task.latestStatus] = (acc[task.latestStatus] || 0) + 1;
          return acc;
        }, {});

        setStatuses(Object.entries(statusCounts).map(([statut, count]) => ({
          statut,
          count
        })));

        // Process documents
        const filteredDocuments = documentsRes.data.filter(doc => 
          taskIds.includes(doc.task_id)
        );
        setDocuments(filteredDocuments);

        // Create history timeline
        const taskIdToName = divisionTasks.reduce((acc, task) => {
          acc[task.task_id] = task.task_name;
          return acc;
        }, {});

        const statusHistory = filteredStatuses.map(status => ({
          hist_id: status.status_id,
          description: `Task "${taskIdToName[status.task_id]}" status updated to ${status.statut}`,
          change_date: status.date_changed,
          task_id: status.task_id
        }));

       
        setHistory([...statusHistory]
          .sort((a, b) => new Date(b.change_date) - new Date(a.change_date)));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['lightblue', 'green', 'red'];

  if (loading) return <div className="loading-indicator">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboardContainer">
      <div className="dashboardHeader">
        <div className="headerTop">
          <div>
            <h1 className="dashboardTitle">Tableau de bord de la division</h1>
            <p className="dashboardSubtitle">
              Bienvenue, {divisionData.division_responsable} ({divisionData.division_nom})
            </p>
          </div>
        </div>
      </div>

    <div className="statsGrid">
        <div className="statCard">
          <p className="statLabel">Total des tâches</p>
          <h2 className="statValue">{tasks.length}</h2>
        </div>

        <div className="statCard">
          <p className="statLabel">En cours</p>
          <h2 className="statValueYellow">
            {statuses.find(s => s.statut === 'En cours')?.count || 0}
          </h2>
        </div>

        <div className="statCard">
          <p className="statLabel">Terminées</p>
          <h2 className="statValueGreen">
            {statuses.find(s => s.statut === 'Terminé')?.count || 0}
          </h2>
        </div>

        <div className="statCard">
          <p className="statLabel">Documents</p>
          <h2 className="statValueBlue">{documents.length}</h2>
        </div>
      </div>

       <div className="mainContent">
        <div className="chartCard">
          <h3 className="sectionTitle">Task Distribution</h3>
          <div className="chartContainer">
            <Box sx={{ height: '300px', position: 'relative' }}>
              <Pie
                data={{
                  labels: statuses.map(s => s.statut),
                  datasets: [
                    {
                      data: statuses.map(s => s.count),
                      backgroundColor: statuses.map((_, idx) => COLORS[idx % COLORS.length]),
                      borderColor: '#fff',
                      borderWidth: 2,
                      hoverOffset: 10,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                          family: "'Inter', sans-serif"
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1f2937',
                      bodyColor: '#4b5563',
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} tasks (${percentage}%)`;
                        }
                      }
                    }
                  },
                  cutout: '60%',
                  animation: {
                    animateScale: true,
                    animateRotate: true
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5
                  }}
                >
                  {statuses.reduce((sum, item) => sum + item.count, 0)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  Total Tasks
                </Typography>
              </Box>
            </Box>
          </div>
        </div>

         <div className="activityCard">
          <h3 className="sectionTitle">Recent Activity</h3>
          <ul className="activityList">
           {history.map((activity, index) => (
              <li key={`activity-${activity.hist_id}-${index}`} className="activityItem">
                <div className="activityContent">
                  <p className="activityDescription">{activity.description}</p>
                  
                </div>
              </li>
            ))} 
          </ul>
        </div> 
      </div>
      <button onClick={()=>{alert(iddiv)}}>hello</button>
          
      <div className="documentsCard">
        <h3 className="sectionTitle">Recent Documents</h3>
        <div className="documentGrid">
          {documents.map((document, index) => (
            <div key={`document-${document.document_id}-${index}`} className="documentItem">
              <p>{tasks[index]?.task_name || 'Unknown Task'}</p>
              <span className="documentIcon">📄</span>
              <div>
                <a href={`http://localhost:8000/storage/${document.document_path}`} target='_blank' rel="noopener noreferrer">Download Document</a> 
              </div>
            </div>
          ))}
        </div>
      </div> 
    </div>
   
  );
};

export default Statisticepardivision;