import React from 'react';
import StyledLoginForm from './loginForm.style';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';

import { Button, Form, Input, Checkbox, Alert } from 'antd';
import { LockOutlined, GithubOutlined, MailOutlined } from '@ant-design/icons';

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
    const [form] = Form.useForm();
    const auth = useAuthContext();
    const router = useRouter();

    const onFinish = values => {
        console.log('onfinish', values);
        auth.login(values);
    };

    return (
        <StyledLoginForm>
            <div>
                { router.query.error && 
                    <Alert type="error" message={router.query.error} banner />
                }
                <Form {...layout}
                    form={form}
                    name="control-hooks"
                    onFinish={onFinish}
                    method="post"
                    action={`${process.env.NEXT_PUBLIC_CLIENT_AUTH_URL}/auth/login`}>
                    <Form.Item
                        name="email"
                        label="E-mail"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            },
                        ]}
                    >
                        <Input name="email" prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Password!',
                            },
                        ]}
                    >
                        <Input
                            name="password"
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox name="remember">Remember me</Checkbox>
                        </Form.Item>
                    </Form.Item>

                    <Form.Item>
                        <div className="login-form__login-opts">
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                Log in
                            </Button>
                            <Link href={`${process.env.NEXT_PUBLIC_CLIENT_AUTH_URL}/auth/github`}>
                                <a>
                                    <Button icon={<GithubOutlined />} type="default" size="small" block>Sign in with Github</Button>
                                </a>
                            </Link>
                        </div>
                    </Form.Item>
                </Form>
                <div className="login-form__sidebar">
                    <Link href="/register">
                        <a>
                            <Button type="link" block>Register</Button>
                        </a>
                    </Link>
                </div>
            </div>

        </StyledLoginForm>
    )
}

export default IndexForm