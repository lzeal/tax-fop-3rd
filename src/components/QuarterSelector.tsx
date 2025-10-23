import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Quarter } from '../types';
import { getQuarterDisplayName } from '../utils/dateUtils';

interface QuarterSelectorProps {
  selectedQuarter: Quarter;
  onQuarterChange: (quarter: Quarter) => void;
}

const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  selectedQuarter,
  onQuarterChange,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const quarters: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const year = event.target.value as number;
    onQuarterChange({ ...selectedQuarter, year });
  };

  const handleQuarterChange = (event: SelectChangeEvent<number>) => {
    const quarter = event.target.value as 1 | 2 | 3 | 4;
    onQuarterChange({ ...selectedQuarter, quarter });
  };

  return (
    <Box>
      <Typography variant="h6" component="div" sx={{ mb: 2 }}>
        Період: {getQuarterDisplayName(selectedQuarter)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="year-select-label">Рік</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedQuarter.year}
            label="Рік"
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="quarter-select-label">Квартал</InputLabel>
          <Select
            labelId="quarter-select-label"
            value={selectedQuarter.quarter}
            label="Квартал"
            onChange={handleQuarterChange}
          >
            {quarters.map((quarter) => (
              <MenuItem key={quarter} value={quarter}>
                {quarter} квартал
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default QuarterSelector;