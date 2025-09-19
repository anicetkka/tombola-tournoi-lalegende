import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  User,
  Gift,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/images/logo.svg" 
                alt="Sack Grc Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">
                Tombola CI
              </span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/tombolas"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Tombolas
            </Link>
            {isAuthenticated && (
              <Link
                to="/user/participations"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Mes Participations
              </Link>
            )}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block">{user?.fullName}</span>
                </button>

                {/* Menu utilisateur */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/user/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Mon Profil
                    </Link>
                    <Link
                      to="/user/participations"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Mes Participations
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="btn btn-primary btn-sm"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Bouton menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/tombolas"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tombolas
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/user/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <Link
                    to="/user/participations"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mes Participations
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Overlay pour fermer le menu utilisateur */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
