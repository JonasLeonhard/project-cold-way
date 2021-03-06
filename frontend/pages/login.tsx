import React from 'react';

import Default from '../templates/default';

import LoginForm from '../components/loginForm/loginForm';

const Login = () => {
  return (
    <Default title="Jonasleonhard.de | Login" description="Jonas Leonhard Login Page">
        <LoginForm />
    </Default>
  )
}

export default Login;