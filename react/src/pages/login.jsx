import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/login', {
        username,
        password,
      });
  
      const user = res.data.user;
      const { username: userName, role ,division_id } = user;
  
      setUser({ username: userName, role ,division_id });
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: 8, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Connexion
          </Typography>
          {error && (
            <Box sx={{ mb: 2 }}>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Box>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom d'utilisateur"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
              Se connecter
            </Button>
          </form>
          
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
