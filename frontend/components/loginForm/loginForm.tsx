import StyledLoginForm from './loginForm.style';
import Link from 'next/link';
import { Button } from 'antd';

import React from 'react';

const IndexForm = () => {
    return (
        <StyledLoginForm>
            <Link href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github`}>
                <a>
                    <Button type="primary" block>Sign in with Github</Button>
                </a>
            </Link>
        </StyledLoginForm>
    )
}

export default IndexForm