import React from 'react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import NewPasswordForm from '../../organisms/NewPasswordForm/NewPasswordForm';

const NewPasswordPage = () => {
  return (
    <AuthLayout>
      <NewPasswordForm />
    </AuthLayout>
  );
};

export default NewPasswordPage;