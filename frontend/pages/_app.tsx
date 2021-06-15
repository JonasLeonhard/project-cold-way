import GlobalStyle from '../styles/globals.style';
import theme from '../styles/theme';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from 'styled-components';
function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default MyApp
