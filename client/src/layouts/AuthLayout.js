import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <img 
              src="/images/logo.svg" 
              alt="Sack Grc Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Tombola Côte d'Ivoire
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Plateforme sécurisée de tombola en ligne
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
