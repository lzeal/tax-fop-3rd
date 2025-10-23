import React from 'react';
import {
  Typography,
  Box,
  Paper,
} from '@mui/material';

const ConfigPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Налаштування імпорту
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Тут буде налаштування формату файлу для імпорту виписки банку.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Ця функціональність буде додана в наступних версіях.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ConfigPage;