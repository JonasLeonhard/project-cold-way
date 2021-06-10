import React from 'react';

import Default from '../templates/default';

import Container from '../components/container/container';
import LoginForm from '../components/loginForm/loginForm';

const Index = () => {
  return (
    <Default title="Jonasleonhard.de | Login" description="Jonas Leonhard Login Page">
        <LoginForm />
    </Default>
  )
}

export default Index;