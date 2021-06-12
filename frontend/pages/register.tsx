import React from 'react';

import Default from '../templates/default';

import RegisterForm from '../components/registerForm/registerForm';

const Register = () => {
  return (
    <Default title="Jonasleonhard.de | Login" description="Jonas Leonhard Login Page">
        <RegisterForm />
    </Default>
  )
}

export default Register;