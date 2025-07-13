import React, { useState } from 'react';
import { Heart, MessageCircle, Upload, Camera, Users, Sparkles, Trophy } from "lucide-react";
import { Vortex } from "@/components/ui/vortex";

export default function Comunidade() {
  const [formData, setFormData] = useState({
    user_name: '',
    city: '',
    state: '',
    description: '',
    before_photo: null as File | null,
    after_photo: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário enviado:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section com Vortex */}
      <div className="h-[30rem] overflow-hidden">
        <Vortex
          backgroundColor="#1e40af"
          rangeY={800}
          particleCount={500}
          baseHue={220}
          className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
        >
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Users className="w-16 h-16 mb-4" />
                <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Comunidade FoodScan
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Transformações reais, histórias inspiradoras! Compartilhe sua jornada e inspire milhares de pessoas.
            </p>
            <div className="flex justify-center space-x-8 text-white/80">
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Resultados Reais</span>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Comunidade Unida</span>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Inspiração Diária</span>
              </div>
            </div>
          </div>
        </Vortex>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário de Envio */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 shadow-2xl border-0 bg-white rounded-lg p-6">
              <div className="text-center pb-4">
                <h2 className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                  <Camera className="w-6 h-6" />
                  Compartilhe sua História
                </h2>
                <p className="text-gray-600">Inspire outras pessoas com sua transformação!</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-blue-600">Nome *</label>
                  <input
                    type="text"
                    id="user_name"
                    value={formData.user_name}
                    onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                    placeholder="Seu nome"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-blue-600">Cidade *</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Sua cidade"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-blue-600">Estado *</label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="UF"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-blue-600">Sua História *</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Conte sua história de transformação..."
                    rows={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-600">Foto ANTES (opcional)</label>
                    <div className="mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, before_photo: e.target.files?.[0] || null})}
                        className="hidden"
                        id="before-photo"
                      />
                      <label htmlFor="before-photo" className="cursor-pointer">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            {formData.before_photo ? formData.before_photo.name : 'Clique para enviar foto ANTES'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-600">Foto DEPOIS (opcional)</label>
                    <div className="mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, after_photo: e.target.files?.[0] || null})}
                        className="hidden"
                        id="after-photo"
                      />
                      <label htmlFor="after-photo" className="cursor-pointer">
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            {formData.after_photo ? formData.after_photo.name : 'Clique para enviar foto DEPOIS'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Compartilhar História 🚀
                </button>
              </form>
            </div>
          </div>

          {/* Feed de Posts */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-600 mb-2">Histórias de Sucesso</h2>
                <p className="text-gray-600">Veja as transformações incríveis da nossa comunidade</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Seja o primeiro!</h3>
                <p className="text-gray-600">Ainda não temos depoimentos. Que tal ser o primeiro a inspirar nossa comunidade?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}