import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../../styles/AdminDashboard.css';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// Import required modules
import { Navigation, Pagination } from 'swiper/modules';

const apiUrl = 'http://127.0.0.1:8000/api/v1';

export default function AdminDashboard() {
  
  const [activeTab, setActiveTab] = useState('En Cours');
  const [tasksByStatus, setTasksByStatus] = useState({
    'Terminé': [],
    'Annulé': [],
    'En attente': [],
    'En Cours': []
  });
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, divisionsRes, statusesRes] = await Promise.all([
          axios.get(`${apiUrl}/tasks`),
          axios.get(`${apiUrl}/divisions`),
          axios.get(`${apiUrl}/statuses`)
        ]);

        const allTasks = tasksRes.data;
        const allStatuses = statusesRes.data;
        setDivisions(divisionsRes.data);

        const tasksWithLatestStatus = allTasks.map(task => {
          const taskStatuses = allStatuses
            .filter(s => s.task_id === task.task_id)
            .sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));

          const latestStatus = taskStatuses[0]?.statut || 'En attente';
          return { ...task, latestStatus };
        });

        const grouped = {
          'Terminé': [],
          'Annulé': [],
          'En attente': [],
          'En Cours': []
        };

        tasksWithLatestStatus.forEach(task => {
          if (grouped[task.latestStatus]) {
            grouped[task.latestStatus].push(task);
          } else {
            grouped['En attente'].push(task);
          }
        });

        setAllTasks(tasksWithLatestStatus);
        setTasksByStatus(grouped);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const groupTasksByDate = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      const date = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'No Due Date';
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    
    return grouped;
  };

  const getStatusTabClass = (status) => {
    switch (status) {
      case 'En Cours':
        return 'status-tab active_tasks';
      case 'Terminé':
        return 'status-tab completed_tasks';
      case 'Annulé':
        return 'status-tab overdue_tasks';
      case 'En attente':
        return 'status-tab pending_tasks';
      default:
        return 'status-tab';
    }
  };

  const getStatusIndicatorClass = (status) => {
    switch (status) {
      case 'En Cours':
        return 'status-indicator active';
      case 'Terminé':
        return 'status-indicator completed';
      case 'Annulé':
        return 'status-indicator overdue';
      case 'En attente':
        return 'status-indicator pending';
      default:
        return 'status-indicator';
    }
  };

  return (
    <div className="dashboard_container">
      <h1>Admin Task Dashboard</h1>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <>
          {/* Divisions Carousel */}
          <div className="divisions-carousel">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={15}
              slidesPerView={'auto'}
              centeredSlides={false}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                1024: { slidesPerView: 3 },
                768: { slidesPerView: 2 },
                480: { slidesPerView: 1 }
              }}
            >
              {divisions.filter(division => 
                  allTasks.some(task => task.division_id === division.division_id)
                )
                .map(division => (
                  <SwiperSlide key={division.division_id}>
                    <Link to={`/app/stidivision/${division.division_id}`}>
                    <div className="divis_card">
                      <h2>{division.division_nom}</h2>
                      <p>{division.description || 'No description available'}</p>
                      <div className="list_taches">
                        {allTasks
                          .filter(task => task.division_id === division.division_id)
                          .map(task => (
                            <div key={task.task_id} className="tache">
                              
                              <span>{task.task_name}</span>
                              <span className={getStatusIndicatorClass(task.latestStatus)}>
                                {task.latestStatus}
                              </span>         
                            </div>
                          ))}
                      </div>
                    </div>
                    </Link>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>

          {/* Tasks by Status Section */}
          <div className="list_of_tasks">
            <div className="title">Tasks by Status</div>
            
            <div className="Tasks_by_status">
              {['En Cours', 'Terminé', 'Annulé', 'En attente'].map(status => (
                <div
                  key={status}
                  className={`${getStatusTabClass(status)} ${activeTab === status ? 'active' : ''}`}
                  onClick={() => setActiveTab(status)}
                >
                  <h2>
                    {status}
                    <span className="task-count">{tasksByStatus[status].length}</span>
                  </h2>
                </div>
              ))}
            </div>

            <div className="tasks-list-ui">
              {tasksByStatus[activeTab].length === 0 ? (
                <p>No tasks with status &quot;{activeTab}&quot;</p>
              ) : (
                <>
                  {Object.entries(groupTasksByDate(tasksByStatus[activeTab])).map(([date, tasks]) => (
                    <div key={date} className="task-group">
                      <h4 className="task-date">{date}</h4>
                      {tasks.map(task => {
                        const division = divisions.find(d => d.division_id === task.division_id);
                        return (
                          <div key={task.task_id} className="task-item">
                            <Link to={`/app/HistoryAdmin/${task.task_id}`}>
                            <div className="task-avatar" style={{ backgroundColor: '#4F46E5' }}>
                              {task.task_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="task-details">
                              <strong>{task.task_name}</strong>
                              <p>{task.description || 'No description'}</p>
                              <small>
                                Division: {division?.division_nom || 'Unknown'} • 
                                Status: {task.latestStatus}
                              </small>
                            </div>
                            <div className="task-status">
                              <span className={getStatusIndicatorClass(task.latestStatus)}>
                                {task.latestStatus}
                              </span>
                            </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}