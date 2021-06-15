import React from 'react';
import StyledRegisterForm from './registerForm.style';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

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
const tailLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    }
};

const IndexForm = () => {
    const [form] = Form.useForm();

    const onFinish = values => {
        console.log('submitted register!', values);
        fetch(`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(values)
        })
        .then(response => response.json())
        .then(data => console.log('return fetch:', data))
        .catch(err => console.log('error fetch', err));
    };

    return (
        <StyledRegisterForm>
            <Form {...layout}
                form={form}
                name="control-hooks"
                onFinish={onFinish}
                method="post"
                action={`http://${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/register`}>
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
                    <Input prefix={<MailOutlined />} />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />}/>
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label="Confirm Password"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(new Error('The two passwords that you entered do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                    name="displayName"
                    label="DisplayName"
                    tooltip="What do you want to be named as? Others will see this name."
                    rules={[
                        {
                            required: true,
                            message: 'Please input your display name!',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined />}/>
                </Form.Item>
                <Form.Item
                    name="businessName"
                    label="BusinessName"
                    rules={[
                        {
                            required: false,
                            message: 'Please input your business name!',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="firstName"
                    label="FirstName"
                    rules={[
                        {
                            required: false,
                            message: 'Please input your first name!',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="lastName"
                    label="LastName"
                    rules={[
                        {
                            required: false,
                            message: 'Please input your last name!',
                            whitespace: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </StyledRegisterForm>
    )
}

export default IndexForm