
import React from 'react';
import { Star, Quote, Heart, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Ana Carolina",
      role: "Nutricionista",
      avatar: "AC",
      rating: 5,
      text: "Incrível como a IA identifica até temperos! Meus pacientes adoram a praticidade e eu confio nos dados nutricionais.",
      highlight: "Revolucionou minha prática!"
    },
    {
      name: "Roberto Silva",
      role: "Personal Trainer",
      avatar: "RS",
      rating: 5,
      text: "O MasterCheFIT é genial! Crio dietas personalizadas em segundos. Meus alunos ficam impressionados com as receitas.",
      highlight: "Economizo 3h por dia!"
    },
    {
      name: "Marina Santos",
      role: "Mãe de 2 filhos",
      avatar: "MS",
      rating: 5,
      text: "Finalmente consegui controlar minha alimentação! O feedback diário me motiva e as receitas são deliciosas.",
      highlight: "Perdi 8kg em 3 meses!"
    }
  ];

  const stats = [
    {
      icon: Heart,
      number: "50k+",
      label: "Usuários Satisfeitos",
      color: "text-red-500"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Avaliação na Loja",
      color: "text-yellow-500"
    },
    {
      icon: Zap,
      number: "1M+",
      label: "Fotos Analisadas",
      color: "text-blue-500"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Statistics */}
      <Card className="bg-gradient-to-r from-primary-50/80 to-purple-50/80 backdrop-blur-sm border border-white/30 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Junte-se a milhares de pessoas que já{' '}
              <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                transformaram sua alimentação
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/60 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="bg-white/95 backdrop-blur-sm border border-white/30 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              O que nossos usuários estão dizendo
            </h3>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600">Mais de 10.000 avaliações positivas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="group relative p-6 rounded-xl bg-gradient-to-br from-white/70 to-white/50 border border-white/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary-300 mb-4" />
                
                {/* Highlight Badge */}
                <div className="inline-block bg-gradient-to-r from-success-100 to-success-50 text-success-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {testimonial.highlight}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <div className="inline-block bg-gradient-to-r from-primary-500/10 to-purple-600/10 rounded-full px-8 py-4">
              <p className="text-primary-700 font-medium text-lg">
                💬 "Melhor app de nutrição que já usei!" - Usuários verificados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
