import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import * as Iconsio5 from 'react-icons/io5';
import * as icontb from 'react-icons/tb';

import './App.css';
import './styles/Dachboard.css';
import './styles/taches.css';
import './styles/Division.css';
import './styles/DivisionManagement.css';
//ADMIN
import AdminDachboard from './pages/user/admine/AdminDashboard';
import AddDivisionTask from './pages/user/admine/Taches';
import AdminDivisions from './pages/user/admine/Division';
import Settings from './pages/user/admine/Settings';
import Statistics from './pages/user/admine/Statistics';
import photoprofile from './images/Screenshot 2025-04-10 141717.png';
//RESPONSABLE
import DashboardPage from './pages/user/divresponsable/DashboardPage';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TaschesDetaile from './pages/user/divresponsable/taschesdetaile';
import UserProfile from './pages/user/UserProfile';
import History from './pages/user/divresponsable/HistoryDivsion';
import TaskManagement from './pages/user/divresponsable/TaskManagement';
import Historyadmin from './pages/user/admine/historyadmin';
import Add from './pages/user/admine/add';
import Statisticepardivision from './pages/user/admine/statisticepardivision';

export default function Maincontent({ user }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  if (!user || !user.username) {
    return (
      <div>
        Non autorisé. Veuillez vous <a href="/">connecter</a>.
      </div>
    );
  }

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="logo">
          <div className="user-role">
            {user.username ? `${user.username}  `: 'Loading...'}
          </div>
          {sidebarCollapsed ? (
            <icontb.TbLayoutSidebarLeftExpand
              size={35}
              fill="#DDDDDD"
              className="Sidebar"
              onClick={toggleSidebar}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <icontb.TbLayoutSidebarLeftCollapse
              size={35}
              fill="#DDDDDD"
              className="Sidebar"
              onClick={toggleSidebar}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>

        <nav className="navigation">
          <ul className="menu-list">
            {user.role === 'admin' && (
              <>
                <li className="menu-item">
                  <Link to="/app" className="menu-link">
                    <Iconsio5.IoHome size={32} className="menu-icon" />
                    <span className="menu-text">Dashboard</span>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/app/Taches" className="menu-link">
                    <Iconsio5.IoList size={32} className="menu-icon" />
                    <span className="menu-text">Task Management</span>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/app/Division" className="menu-link">
                    <Iconsio5.IoAnalytics size={32} className="menu-icon" />
                    <span className="menu-text">Division Management</span>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/app/Statistics" className="menu-link">
                    <Iconsio5.IoStatsChart size={32} className="menu-icon" />
                    <span className="menu-text">Statistics</span>
                  </Link>
                </li>
               
                <li className="menu-item">
                  <Link to="/app/Settings" className="menu-link">
                    <Iconsio5.IoSettings size={32} className="menu-icon" />
                    <span className="menu-text">Settings</span>
                  </Link>
                </li>
              </>
            )}

            {user.role === 'division_responsable' && (
              <>
                <li className="menu-item">
                  <Link to="/app" className="menu-link">
                    <Iconsio5.IoHome size={32} className="menu-icon" />
                    <span className="menu-text">Dashboard</span>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/app/Detail" className="menu-link">
                    <Iconsio5.IoList size={32} className="menu-icon" />
                    <span className="menu-text">Task Detail</span>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/app/TaskManagement" className="menu-link">
                    <Iconsio5.IoAnalytics size={32} className="menu-icon" />
                    <span className="menu-text">Task Management</span>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/app/Settings" className="menu-link">
                    <Iconsio5.IoSettings size={32} className="menu-icon" />
                    <span className="menu-text">Settings</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>

      <header className="app-header">
        <div className="user-actions">
          <button className="notification-btn">
            <Iconsio5.IoNotificationsSharp size={22} />
            <span className="notification-badge">3</span>
          </button>
          <div className="user-profile">
            <IconButton onClick={handleProfileClick}>
              <img src={photoprofile} alt="User profile" className="profile-image" />
            </IconButton>
            <Menu
              id="profile-menu"
              style={{padding:"0%"}}
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Link to={`/app/Profile/${user.username}/${user.role}/${user.division_id}`} >
              <MenuItem onClick={() => {
                handleCloseMenu(); 
              }}>
                    <span >Profil</span>
              </MenuItem>
              </Link>
              <MenuItem onClick={() => (window.location.href = '/')}>Déconnexion</MenuItem>
            </Menu>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="Profile/:user/:role/:division" element={<UserProfile />} />
          {user.role === 'admin' && (
            <>
              <Route index element={<AdminDachboard />} />
              <Route path="Taches" element={<AddDivisionTask />} />
              <Route path="Division" element={<AdminDivisions />} />
              <Route path="Statistics" element={<Statistics />} />
       
              <Route path="HistoryAdmin/:idid_task" element={<Historyadmin />} />
              <Route path="stidivision/:iddiv" element={<Statisticepardivision />} />
              <Route path="Settings" element={<Settings />} />
            </>
          )}

          {user.role === 'division_responsable' && (
            <>
              <Route index element={<DashboardPage user={user} />} />
              <Route path="Detail" element={<TaschesDetaile user={user} />} />
              <Route path="history/:id_task" element={<History />} />
              <Route path="TaskManagement" element={<TaskManagement user={user}/>} />
              <Route path="Settings" element={<Settings />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}