import React from 'react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import ForgotPasswordForm from '../../organisms/ForgotPasswordForm/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout title="نسيت كلمة المرور">
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;