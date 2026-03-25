import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Search, MapPin, Phone, Stethoscope, Upload, Image as ImageIcon, MessageCircle, Trash2, DollarSign, Mail } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
type NutritionistAd = Database['public']['Tables']['nutritionist_ads']['Row'] & {
  profile_name?: string;
  specialties?: string[];
};
const ServiNUTRI = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [ads, setAds] = useState<NutritionistAd[]>([]);
  const [userAds, setUserAds] = useState<NutritionistAd[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    state: '',
    city: '',
    specialties: [] as string[],
    phone_ddd: '',
    phone_number: '',
    consultation_price: '',
    photo_url: '',
    logo_url: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const specialties = [{
    value: 'nutricao_clinica',
    label: 'Nutrição Clínica'
  }, {
    value: 'nutricao_esportiva',
    label: 'Nutrição Esportiva'
  }, {
    value: 'nutricao_funcional',
    label: 'Nutrição Funcional'
  }, {
    value: 'nutricao_estetica',
    label: 'Nutrição Estética'
  }, {
    value: 'nutricao_materno_infantil',
    label: 'Nutrição Materno-Infantil'
  }, {
    value: 'nutricao_hospitalar',
    label: 'Nutrição Hospitalar'
  }, {
    value: 'nutricao_coletiva',
    label: 'Nutrição Coletiva'
  }, {
    value: 'nutricao_saude_publica',
    label: 'Nutrição em Saúde Pública'
  }];
  const brazilianStates = [{
    value: 'AC',
    label: 'AC - Acre'
  }, {
    value: 'AL',
    label: 'AL - Alagoas'
  }, {
    value: 'AP',
    label: 'AP - Amapá'
  }, {
    value: 'AM',
    label: 'AM - Amazonas'
  }, {
    value: 'BA',
    label: 'BA - Bahia'
  }, {
    value: 'CE',
    label: 'CE - Ceará'
  }, {
    value: 'DF',
    label: 'DF - Distrito Federal'
  }, {
    value: 'ES',
    label: 'ES - Espírito Santo'
  }, {
    value: 'GO',
    label: 'GO - Goiás'
  }, {
    value: 'MA',
    label: 'MA - Maranhão'
  }, {
    value: 'MT',
    label: 'MT - Mato Grosso'
  }, {
    value: 'MS',
    label: 'MS - Mato Grosso do Sul'
  }, {
    value: 'MG',
    label: 'MG - Minas Gerais'
  }, {
    value: 'PA',
    label: 'PA - Pará'
  }, {
    value: 'PB',
    label: 'PB - Paraíba'
  }, {
    value: 'PR',
    label: 'PR - Paraná'
  }, {
    value: 'PE',
    label: 'PE - Pernambuco'
  }, {
    value: 'PI',
    label: 'PI - Piauí'
  }, {
    value: 'RJ',
    label: 'RJ - Rio de Janeiro'
  }, {
    value: 'RN',
    label: 'RN - Rio Grande do Norte'
  }, {
    value: 'RS',
    label: 'RS - Rio Grande do Sul'
  }, {
    value: 'RO',
    label: 'RO - Rondônia'
  }, {
    value: 'RR',
    label: 'RR - Roraima'
  }, {
    value: 'SC',
    label: 'SC - Santa Catarina'
  }, {
    value: 'SP',
    label: 'SP - São Paulo'
  }, {
    value: 'SE',
    label: 'SE - Sergipe'
  }, {
    value: 'TO',
    label: 'TO - Tocantins'
  }];
  const citiesByState = {
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó'],
    'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato'],
    'DF': ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Planaltina'],
    'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
    'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves'],
    'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano'],
    'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó'],
    'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins']
  };
  const dddOptions = ['11', '12', '13', '14', '15', '16', '17', '18', '19',
  // SP
  '21', '22', '24',
  // RJ
  '27', '28',
  // ES
  '31', '32', '33', '34', '35', '37', '38',
  // MG
  '41', '42', '43', '44', '45', '46',
  // PR
  '47', '48', '49',
  // SC
  '51', '53', '54', '55',
  // RS
  '61',
  // DF
  '62', '64',
  // GO
  '63',
  // TO
  '65', '66',
  // MT
  '67',
  // MS
  '68',
  // AC
  '69',
  // RO
  '71', '73', '74', '75', '77',
  // BA
  '79',
  // SE
  '81', '87',
  // PE
  '82',
  // AL
  '83',
  // PB
  '84',
  // RN
  '85', '88',
  // CE
  '86', '89',
  // PI
  '91', '93', '94',
  // PA
  '92', '97',
  // AM
  '95',
  // RR
  '96',
  // AP
  '98', '99' // MA
  ];
  const handleStateChange = (value: string) => {
    setFormData({
      ...formData,
      state: value,
      city: ''
    });
  };
  const handleSpecialtyChange = (specialtyValue: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialtyValue]
      });
    } else {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(s => s !== specialtyValue)
      });
    }
  };
  const getAvailableCities = () => {
    if (!formData.state) return [];
    return citiesByState[formData.state as keyof typeof citiesByState] || [];
  };
  useEffect(() => {
    fetchAds();
    if (user) {
      fetchUserAds();
    }
  }, [user]);
  const fetchAds = async () => {
    try {
      // Primeiro buscar os anúncios
      const {
        data: adsData,
        error: adsError
      } = await supabase.from('nutritionist_ads').select('*').order('created_at', {
        ascending: false
      });
      if (adsError) throw adsError;

      // Depois buscar os perfis dos usuários
      const userIds = adsData?.map(ad => ad.user_id) || [];
      const {
        data: profilesData,
        error: profilesError
      } = await supabase.from('profiles').select('id, name').in('id', userIds);
      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
      }

      // Combinar os dados
      const adsWithProfiles = adsData?.map(ad => ({
        ...ad,
        profile_name: profilesData?.find(profile => profile.id === ad.user_id)?.name || 'Nutricionista'
      })) || [];
      setAds(adsWithProfiles);
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
    }
  };
  const fetchUserAds = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('nutritionist_ads').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      const adsWithProfiles = data?.map(ad => ({
        ...ad,
        profile_name: 'Meus Anúncios'
      })) || [];
      setUserAds(adsWithProfiles);
    } catch (error) {
      console.error('Erro ao buscar anúncios do usuário:', error);
    }
  };
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${folder}/${uniqueId}.${fileExt}`;
    const {
      error: uploadError
    } = await supabase.storage.from('nutritionist-ads').upload(fileName, file);
    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return null;
    }
    const {
      data: {
        publicUrl
      }
    } = supabase.storage.from('nutritionist-ads').getPublicUrl(fileName);
    return publicUrl;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.specialties.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma especialidade.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      let photoUrl = formData.photo_url;
      let logoUrl = formData.logo_url;

      // Upload da foto
      if (photoFile) {
        photoUrl = (await uploadFile(photoFile, 'photos')) || '';
      }

      // Upload da logo
      if (logoFile) {
        logoUrl = (await uploadFile(logoFile, 'logos')) || '';
      }

      // Criar apenas UM anúncio com múltiplas especialidades
      const { error } = await supabase.from('nutritionist_ads').insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        state: formData.state,
        city: formData.city,
        specialty: formData.specialties[0] as any, // Especialidade principal
        specialties: formData.specialties,          // Array com todas as especialidades
        phone_ddd: formData.phone_ddd,
        phone_number: formData.phone_number,
        consultation_price: formData.consultation_price ? parseFloat(formData.consultation_price) : null,
        photo_url: photoUrl,
        logo_url: logoUrl
      });

      if (error) throw error;
      toast({
        title: "Sucesso!",
        description: "Seu anúncio foi cadastrado com sucesso."
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        state: '',
        city: '',
        specialties: [],
        phone_ddd: '',
        phone_number: '',
        consultation_price: '',
        photo_url: '',
        logo_url: ''
      });
      setPhotoFile(null);
      setLogoFile(null);
      setShowForm(false);
      fetchAds();
      fetchUserAds();
    } catch (error) {
      console.error('Erro ao cadastrar anúncios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar os anúncios. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAd = async (adId: string) => {
    if (!user) return;
    setDeleteLoading(adId);
    try {
      const {
        error
      } = await supabase.from('nutritionist_ads').delete().eq('id', adId).eq('user_id', user.id);
      if (error) throw error;
      toast({
        title: "Sucesso!",
        description: "Anúncio removido com sucesso."
      });
      fetchAds();
      fetchUserAds();
    } catch (error) {
      console.error('Erro ao remover anúncio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o anúncio. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(null);
    }
  };
  const handleAISearch = async () => {
    if (!searchTerm.trim()) {
      fetchAds();
      return;
    }
    setSearchLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-search-nutritionists', {
        body: {
          searchTerm,
          ads
        }
      });
      if (error) throw error;
      setAds(data.filteredAds || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      // Fallback para busca simples
      const filtered = ads.filter(ad => {
        const matchesCity = ad.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = ad.state.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesName = ad.profile_name && ad.profile_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = ad.specialties?.some(spec => 
          getSpecialtyLabel(spec).toLowerCase().includes(searchTerm.toLowerCase())
        ) || getSpecialtyLabel(ad.specialty).toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCity || matchesState || matchesName || matchesSpecialty;
      });
      setAds(filtered);
    } finally {
      setSearchLoading(false);
    }
  };
  const getSpecialtyLabel = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.label || specialty;
  };
  const formatPrice = (price: number | null) => {
    if (!price) return 'Valor não informado';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };
  return (
    <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container mx-auto px-4 pt-20 pb-28">
          {/* Header Card */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">ServiNUTRI</h1>
            </div>
          </div>

          {/* Card Informativo */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="block lg:table w-full">
              <div className="block lg:table-row">
                <div className="block lg:table-cell w-full lg:w-2/3 p-3 sm:p-4 md:p-6 align-top">
                  <p className="text-gray-700 leading-relaxed text-justify text-sm sm:text-base">
                    Aqui na We Diet, acreditamos que tecnologia é uma aliada, mas jamais um substituto para o olhar humano. 
                    Por mais avançada que seja a inteligência artificial, nada supera o cuidado, a empatia e o atendimento personalizado 
                    que só um profissional de Nutrição pode oferecer. Por isso, criamos o ServiNUTRI, uma funcionalidade que conecta 
                    você diretamente com nutricionistas qualificados. Nosso objetivo é unir tecnologia e atendimento humanizado, 
                    oferecendo não só dados, mas também orientação, acompanhamento e motivação real para sua jornada alimentar.
                  </p>
                </div>
                <div className="block lg:table-cell w-full lg:w-1/3 p-3 sm:p-4 md:p-6 align-top">
                  <div className="flex justify-center">
                    <img alt="Nutrição e alimentação saudável" className="rounded-lg shadow-md w-full max-w-xs sm:max-w-sm object-cover" src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/image?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvaW1hZ2UiLCJpYXQiOjE3NTAyNjEzNTUsImV4cCI6MTc4MTc5NzM1NX0.0WeU-fnnvTafoepwV_0wWUI6_Dffe7CpYkwG2o06gYI" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Busca com IA */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input placeholder="Busque por especialidade, cidade, estado ou qualquer critério..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="text-sm lg:text-lg" />
              </div>
              <Button onClick={handleAISearch} disabled={searchLoading} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meus Anúncios - só mostra se o usuário está logado e tem anúncios */}
        {user && userAds.length > 0 && <Card className="mb-8">
            <CardHeader>
              <CardTitle>Meus Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userAds.map(ad => <Card key={ad.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {ad.photo_url ? <img src={ad.photo_url} alt="Foto do nutricionista" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{ad.name || 'Nutricionista'}</h4>
                          {ad.logo_url && <img src={ad.logo_url} alt="Logo" className="w-8 h-8 object-contain mt-1" />}
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteAd(ad.id)} disabled={deleteLoading === ad.id}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                       <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {ad.city}, {ad.state}
                        </div>
                        <div className="flex items-start gap-2 text-gray-600">
                          <Stethoscope className="w-3 h-3 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {ad.specialties && ad.specialties.length > 0 ? (
                              ad.specialties.map((spec, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {getSpecialtyLabel(spec)}
                                </Badge>
                              ))
                            ) : (
                              <span>{getSpecialtyLabel(ad.specialty)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3 h-3" />
                          ({ad.phone_ddd}) {ad.phone_number}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          {formatPrice(ad.consultation_price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </CardContent>
          </Card>}

        {/* Card de Cadastro */}
        {!showForm && <Card className="mb-8 border-2 border-dashed border-green-300 hover:border-green-500 transition-colors">
            <CardContent className="p-8 text-center">
              <UserPlus className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cadastrar Serviço</h3>
              <p className="text-gray-600 mb-4">Divulgue seu trabalho como nutricionista</p>
              <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar
              </Button>
            </CardContent>
          </Card>}

        {/* Formulário de Cadastro */}
        {showForm && <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastrar Anúncio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Select value={formData.state} onValueChange={handleStateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {brazilianStates.map(state => <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" value={formData.city} onChange={e => setFormData({
                  ...formData,
                  city: e.target.value
                })} placeholder="Digite sua cidade" required />
                  </div>
                </div>

                <div>
                  <Label>Especialidades (selecione uma ou mais)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {specialties.map(specialty => <div key={specialty.value} className="flex items-center space-x-2">
                        <Checkbox id={specialty.value} checked={formData.specialties.includes(specialty.value)} onCheckedChange={checked => handleSpecialtyChange(specialty.value, checked as boolean)} />
                        <Label htmlFor={specialty.value} className="text-sm font-normal cursor-pointer">
                          {specialty.label}
                        </Label>
                      </div>)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ddd">DDD</Label>
                    <Select value={formData.phone_ddd} onValueChange={value => setFormData({
                  ...formData,
                  phone_ddd: value
                })}>
                      <SelectTrigger>
                        <SelectValue placeholder="DDD" />
                      </SelectTrigger>
                      <SelectContent>
                        {dddOptions.map(ddd => <SelectItem key={ddd} value={ddd}>
                            {ddd}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" value={formData.phone_number} onChange={e => setFormData({
                  ...formData,
                  phone_number: e.target.value
                })} placeholder="99999-9999" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="consultation_price">Valor da Consulta (R$)</Label>
                  <Input id="consultation_price" type="number" step="0.01" value={formData.consultation_price} onChange={e => setFormData({
                ...formData,
                consultation_price: e.target.value
              })} placeholder="150.00" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo">Foto Pessoal</Label>
                    <Input id="photo" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="cursor-pointer" />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logomarca (Opcional)</Label>
                    <Input id="logo" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="cursor-pointer" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                    {loading ? 'Cadastrando...' : 'Cadastrar Anúncio'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>}

        {/* Lista de Anúncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => <Card key={ad.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {ad.photo_url ? <img src={ad.photo_url} alt="Foto do nutricionista" className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ad.name || 'Nutricionista'}</h3>
                    {ad.logo_url && <img src={ad.logo_url} alt="Logo" className="w-12 h-12 object-contain mt-2" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {ad.city}, {ad.state}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4 mt-1" />
                    <div className="flex flex-wrap gap-1.5">
                      {ad.specialties && ad.specialties.length > 0 ? (
                        ad.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {getSpecialtyLabel(spec)}
                          </Badge>
                        ))
                      ) : (
                        <span>{getSpecialtyLabel(ad.specialty)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    ({ad.phone_ddd}) {ad.phone_number}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {formatPrice(ad.consultation_price)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {ad.email}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                const message = encodeURIComponent("Oi, ví seu anúncio no FoodScan & Diet, tenho interesse no atendimento");
                window.open(`https://wa.me/55${ad.phone_ddd}${ad.phone_number}?text=${message}`, '_blank');
              }}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${ad.email}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {ads.length === 0 && <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum anúncio encontrado.</p>
          </div>}
      </div>
    </div>
  );
};
export default ServiNUTRI;
