import App from "next/app";
import GlobalStyle from '../styles/globals.style';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';

import { AuthProvider, getAuth, redirectProtectedRoutesOnAuthMissing } from '../contexts/AuthContext';
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

  await redirectProtectedRoutesOnAuthMissing(ctx.ctx, auth);
  return { ...appProps, auth: auth };
};

export default MyApp
