import React from 'react';
import { useRouter } from 'next/router';
import StyledRegisterForm from './registerForm.style';
import { useAuthContext } from '../../contexts/AuthContext';
import { Form, Input, Button, Alert } from 'antd';
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
    const auth = useAuthContext();
    const router = useRouter();
    const onFinish = values => {
        console.log('submitted register!', values);
        auth.register(values);
    };

    return (
        <StyledRegisterForm>
            { router.query.error && 
                <Alert type="error" message={router.query.error} banner />
            }
            <Form {...layout}
                form={form}
                name="control-hooks"
                onFinish={onFinish}
                method="post"
                action={`${process.env.NEXT_PUBLIC_CLIENT_BACKEND_URL}/auth/register`}>
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
                    <Input name="email" prefix={<MailOutlined />} />
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
                    <Input.Password name="password" prefix={<LockOutlined />}/>
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
                    <Input.Password name="confirm" prefix={<LockOutlined />} />
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
                    <Input name="displayName" prefix={<UserOutlined />}/>
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
                    <Input name="businessName" />
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
                    <Input name="firstName" />
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
                    <Input name="lastName" />
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