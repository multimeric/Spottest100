import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.tsx'

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(224, 49, 37)',
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <App year={null} votingListName='Australian Songs (2025)' />
  </ThemeProvider>
)
