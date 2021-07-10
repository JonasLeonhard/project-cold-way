import StyledLogoutForm from './logoutForm.style';
import { useAuthContext } from '../../contexts/AuthContext';

import { Button, Form } from 'antd';

const layout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 8,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    }
};

const IndexForm = () => {
    const auth = useAuthContext();
    const onFinish = values => {
        console.log('onFinish', values);
        auth.logout();
    };

    return (
        <StyledLogoutForm>
            <Form
                name="control-hooks"
                onFinish={onFinish}
                method="post"
                action={`${process.env.NEXT_PUBLIC_CLIENT_AUTH_URL}/auth/logout`}>
                <Form.Item>
                    <p>Are you sure you want to log out as 
                        <span className="logout-form__display-name"> {auth.auth?.user?.displayName} </span>?
                    </p>
                    <Button type="primary" htmlType="submit">
                        Log out
                    </Button>
                </Form.Item>
            </Form>
        </StyledLogoutForm>
    )
}

export default IndexForm