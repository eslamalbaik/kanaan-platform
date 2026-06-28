import React from 'react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import LoginForm from '../../organisms/LoginForm/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout title="تسجيل دخول">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;