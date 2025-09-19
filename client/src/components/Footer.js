import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Tombola Côte d'Ivoire</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Plateforme sécurisée de tombola en ligne pour la Côte d'Ivoire. 
              Participez à nos tirages au sort et tentez de gagner des cagnottes 
              via Wave et Orange Money.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+225 01 234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@tombola-ci.com</span>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/tombolas" className="text-gray-300 hover:text-white transition-colors">
                  Tombolas
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="text-gray-300 hover:text-white transition-colors">
                  S'inscrire
                </Link>
              </li>
              <li>
                <Link to="/auth/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">Comment participer</span>
              </li>
              <li>
                <span className="text-gray-300">Méthodes de paiement</span>
              </li>
              <li>
                <span className="text-gray-300">Règles et conditions</span>
              </li>
              <li>
                <span className="text-gray-300">Support client</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4 md:mb-0">
              <MapPin className="w-4 h-4" />
              <span>Abidjan, Côte d'Ivoire</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Tombola Côte d'Ivoire. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
