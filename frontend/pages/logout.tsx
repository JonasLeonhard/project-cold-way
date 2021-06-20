import React from 'react';

import Default from '../templates/default';
import LogoutForm from '../components/logoutForm/logoutForm';

const Logout = () => {
  return (
    <Default title="Jonasleonhard.de | Login" description="Jonas Leonhard Login Page">
        <LogoutForm />
    </Default>
  )
}

export default Logout;