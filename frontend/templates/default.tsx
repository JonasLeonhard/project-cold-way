import React from 'react';
import StyledDefault from './default.style';

import SeoHead from '../components/seoHead/seoHead';
import Container from '../components/container/container';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';

type DefaultProps = {
  children: JSX.Element | string;
  title: string;
  description: string; 
  noindex?: boolean | undefined;
  nofollow?: boolean | undefined;
};

const Default: React.FC<DefaultProps> = ({ children, title, description, noindex, nofollow }: DefaultProps) => {
  return (
    <StyledDefault>
        <Header />
        <SeoHead title={title} description={description} noindex={noindex} nofollow={nofollow} />

        <Container className="default__container">
          {children}
        </Container>

        <Footer />
    </StyledDefault>
  )
}

export default Default;