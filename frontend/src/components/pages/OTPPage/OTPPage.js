import React from 'react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import OTPVerificationForm from '../../organisms/OTPVerificationForm/OTPVerificationForm';

const OTPPage = () => {
  return (
    <AuthLayout title="نسيت كلمة المرور">
      <OTPVerificationForm />
    </AuthLayout>
  );
};

export default OTPPage;