import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Sort as SortIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function TaskManagement({ user }) {
  
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?.division_id) {
      fetchTasks();
    }
  }, [user?.division_id]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/tasks');
      setAllTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch tasks',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get current status from the last entry in statuses array
  const getCurrentStatus = (task) => {
    if (!task.statuses || task.statuses.length === 0) return 'En attente';
    return task.statuses[task.statuses.length - 1].statut;
  };

  // Check if task can be activated
  const canActivateTask = (task) => {
    const status = getCurrentStatus(task);
    return status.toLowerCase() === 'en attente';
  };

  const handleActivateTask = async (taskId) => {
    if (!taskId) {
      setSnackbar({
        open: true,
        message: 'Invalid task ID',
        severity: 'error'
      });
      return;
    }

    try {
      // Find the current task's latest status
      const taskToUpdate = allTasks.find(task => task.task_id === taskId);
      const currentStatus = taskToUpdate?.statuses?.[taskToUpdate.statuses.length - 1];
      
      if (!currentStatus) {
        // If no status exists, create one
        await axios.post('http://127.0.0.1:8000/api/v1/statuses', {
          statut: 'En Cours',
          date_changed: new Date().toISOString().split('T')[0],
          task_id: taskId
        });
      } else {
        // If status exists, update it
        await axios.put(`http://127.0.0.1:8000/api/v1/statuses/${currentStatus.state_id}`, {
          statut: 'En Cours',
          date_changed: new Date().toISOString().split('T')[0],
          task_id: taskId
        });
      }

      // Update UI only after successful API call
      setAllTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.task_id === taskId) {
            return {
              ...task,
              statuses: [
                ...(task.statuses || []),
                {
                  statut: 'En Cours',
                  date_changed: new Date().toISOString(),
                  task_id: taskId
                }
              ]
            };
          }
          return task;
        })
      );

      setSnackbar({
        open: true,
        message: 'Task status updated to "En Cours"',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating task status:', error.response ? error.response.data : error.message);
      setSnackbar({
        open: true,
        message: `Failed to update task status: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  // Filter tasks by division_id
  const divisionTasks = allTasks.filter(task => task.division_id === user.division_id);

  // Filter tasks by status (only pending tasks)
  const pendingTasks = divisionTasks.filter(task => {
    const status = getCurrentStatus(task);
    return status.toLowerCase() === 'en attente';
  });

  // Apply search and date filters
  const filteredTasks = pendingTasks
    .filter(task => {
      const matchesSearch = task.task_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !dateFilter || new Date(task.due_date).toDateString() === dateFilter.toDateString();
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Debug logging
  console.log('All Tasks:', allTasks);
  console.log('Division Tasks:', divisionTasks);
  console.log('Pending Tasks:', pendingTasks);
  console.log('Filtered Tasks:', filteredTasks);

  if (!user?.division_id) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Please log in to view tasks
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Pending Tasks for {user.division_nom}
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Filter by date"
            value={dateFilter}
            onChange={setDateFilter}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}
          />
        </LocalizationProvider>

        <IconButton
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
          aria-label="sort"
        >
          <SortIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.task_id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" noWrap>
                    {task.task_name}
                  </Typography>
                  <Chip
                    label={getCurrentStatus(task)}
                    color={
                      getCurrentStatus(task).toLowerCase() === 'terminée' ? 'success' :
                      getCurrentStatus(task).toLowerCase() === 'en cours' ? 'primary' :
                      getCurrentStatus(task).toLowerCase() === 'annulée' ? 'error' :
                      'warning'
                    }
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  {task.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleActivateTask(task.task_id)}
                  disabled={!canActivateTask(task)}
                >
                  Start Task
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setSortOrder('desc');
          setSortAnchorEl(null);
        }}>
          Newest First
        </MenuItem>
        <MenuItem onClick={() => {
          setSortOrder('asc');
          setSortAnchorEl(null);
        }}>
          Oldest First
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 