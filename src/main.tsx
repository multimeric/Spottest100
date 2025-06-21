import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(224, 49, 37)',
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <App/>
  </ThemeProvider>
)
