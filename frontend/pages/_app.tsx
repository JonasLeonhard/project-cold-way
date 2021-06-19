import GlobalStyle from '../styles/globals.style';
import theme from '../styles/theme';

import App from "next/app";
import { AuthProvider, getAuth } from '../contexts/AuthContext';
import { ThemeProvider } from 'styled-components';

function MyApp({ Component, pageProps, auth }) {
  return (
    <AuthProvider auth={auth} >
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  )
}

MyApp.getInitialProps = async (ctx) => {
  const appProps = await App.getInitialProps(ctx);
  const auth = await getAuth(ctx.ctx);
  return { ...appProps, auth: auth };
};

export default MyApp
