import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Gift, Users, Shield, Clock, Star, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Plateforme sécurisée avec validation manuelle des paiements'
    },
    {
      icon: Users,
      title: 'Transparent',
      description: 'Processus de tirage transparent et traçable'
    },
    {
      icon: Clock,
      title: 'Rapide',
      description: 'Validation des participations en 24-48h maximum'
    },
    {
      icon: Gift,
      title: 'Gagnant',
      description: 'Cagnottes attractives et paiements via Wave/Orange Money'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Inscrivez-vous',
      description: 'Créez votre compte avec votre numéro de téléphone ivoirien'
    },
    {
      number: '2',
      title: 'Choisissez une tombola',
      description: 'Sélectionnez la tombola qui vous intéresse et consultez les détails'
    },
    {
      number: '3',
      title: 'Effectuez le paiement',
      description: 'Payez via Wave ou Orange Money sur le compte indiqué'
    },
    {
      number: '4',
      title: 'Soumettez votre participation',
      description: 'Remplissez le formulaire avec les détails de votre transaction'
    },
    {
      number: '5',
      title: 'Attendez la validation',
      description: 'L\'administrateur validera votre participation sous 24-48h'
    },
    {
      number: '6',
      title: 'Suivez le tirage',
      description: 'Le tirage sera effectué après la date de fin définie'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tombola Côte d'Ivoire
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Plateforme sécurisée de tombola en ligne. Participez à nos tirages au sort 
              et tentez de gagner des cagnottes via Wave et Orange Money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/tombolas"
                    className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
                  >
                    Voir les Tombolas
                  </Link>
                  <Link
                    to="/user/profile"
                    className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8"
                  >
                    Mon Profil
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
                  >
                    S'inscrire
                  </Link>
                  <Link
                    to="/auth/login"
                    className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre plateforme ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une expérience de tombola sécurisée, transparente et adaptée à la Côte d'Ivoire
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment participer ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un processus simple en 6 étapes pour participer à nos tombolas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="card p-6 h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                
                {/* Flèche de connexion */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Méthodes de paiement
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Payez facilement via les services de paiement mobile les plus populaires en Côte d'Ivoire
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">O</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Orange Money
              </h3>
              <p className="text-gray-600 mb-4">
                Payez directement via votre compte Orange Money
              </p>
              <div className="text-sm text-gray-500">
                Compte: +225 01 234 5678
              </div>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">W</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Wave
              </h3>
              <p className="text-gray-600 mb-4">
                Payez facilement via votre compte Wave
              </p>
              <div className="text-sm text-gray-500">
                Compte: +225 01 234 5678
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à participer ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté et tentez votre chance pour gagner des cagnottes attractives
          </p>
          {!isAuthenticated && (
            <Link
              to="/auth/register"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8"
            >
              Commencer maintenant
            </Link>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6" />
                <span className="text-sm font-medium">Fiable</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Communauté</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
