import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';

const NProgressComponent = () => {
    const router = useRouter();

    useEffect(() => {
        NProgress.configure({ showSpinner: false });
        const routeChangeStart = (url) => {
            console.log(`Loading: ${url}`)
            NProgress.start()
          };
        const routeChangeComplete = () => NProgress.done();
        const routeChangeError = () => NProgress.done();

        router.events.on('routeChangeStart', routeChangeStart); 
        router.events.on('routeChangeComplete', routeChangeComplete);
        router.events.on('routeChangeError', routeChangeError);

        return () => {
            router.events.off('routeChangeStart', routeChangeStart);
            router.events.off('routeChangeComplete', routeChangeComplete);
            router.events.off('routeChangeError', routeChangeError);
        };
    }, []);

  return (
    <></>
  )
}

export default NProgressComponent