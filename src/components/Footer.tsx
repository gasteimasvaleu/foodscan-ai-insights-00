import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const menuItems = [{
    label: 'Início',
    href: '/'
  }, {
    label: 'FoodScan',
    href: '/foodscan'
  }, {
    label: 'Controle Diário',
    href: '/controle-diario'
  }, {
    label: 'FitTracker',
    href: '/fit-tracker'
  }, {
    label: 'MasterCheFIT',
    href: '/masterchef'
  }, {
    label: 'ServiNUTRI',
    href: '/servinutri'
  }, {
    label: 'Quero Assinar',
    href: '/quero-assinar'
  }, {
    label: 'Sobre',
    href: '/sobre'
  }];
  return <footer className="bg-white/80 backdrop-blur-md border-t border-white/20 shadow-sm mt-12">
      <div className="container mx-auto px-[21px] py-[20px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/">
              <h3 className="text-xl font-bold text-primary-600">FoodScan & Diet</h3>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Transforme sua alimentação com tecnologia de ponta. Análise nutricional inteligente na palma da sua mão.
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm">Feito com amor para sua saúde</span>
            </div>
          </div>

          {/* Links de Navegação */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Navegação</h4>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.map(item => <Link key={item.label} to={item.href} className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm">
                  {item.label}
                </Link>)}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600 text-sm">foodscanEdiet@hotmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600 text-sm">(83) 99918-7322</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span className="text-gray-600 text-sm">João Pessoa, Paraíba,  Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Separação e Copyright */}
        <div className="border-t border-white/20 mt-8 pt-6 py-0">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 px-[6px]">
            <p className="text-gray-600 text-sm">
              © {currentYear} FoodScan & Diet. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link to="/sobre" className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm">
                Política de Privacidade
              </Link>
              <Link to="/sobre" className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};