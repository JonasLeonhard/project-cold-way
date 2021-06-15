import React from 'react';
import StyledLoginForm from './loginForm.style';
import Link from 'next/link';
import { useRouter } from 'next/router'

import { Button, Form, Input, Checkbox } from 'antd';
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
    const router = useRouter();

    const onFinish = values => {
        console.log('onfinish', values);
        fetch(`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(values)
        })
        .then(response => response.json())
        .then(data => {
            console.log('rec:', data);
            router.push(data.data)
        })
        .catch(err => console.log('error fetch', err));
    };

    return (
        <StyledLoginForm>
            <div>

        
            <Form {...layout}
                form={form}
                name="control-hooks"
                onFinish={onFinish}
                method="post"
                action={`http://${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/login`}>
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
                    <Input prefix={<MailOutlined />} placeholder="Email" />
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
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                </Form.Item>

                <Form.Item>
                    <div className="login-form__login-opts">
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                        <Link href={`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/github`}>
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