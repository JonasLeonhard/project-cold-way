import React from 'react';

import Default from '../templates/default';

import Container from '../components/container/container';
import LogoutForm from '../components/logoutForm/logoutForm';

const Logout = () => {
  return (
    <Default title="Jonasleonhard.de | Login" description="Jonas Leonhard Login Page">
        <Container>
          <LogoutForm />
        </Container>
    </Default>
  )
}

export default Logout;