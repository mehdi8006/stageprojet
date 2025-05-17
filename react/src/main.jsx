import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { UserProvider } from './context/UserContext'
// import LoginPage from './pages/login.jsx'
// import TaskForm from './test'
// import { BrowserRouter } from 'react-router-dom';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
    {/* <TaskForm/> */}
  </StrictMode>,
)
