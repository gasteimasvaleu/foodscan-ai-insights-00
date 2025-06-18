
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Search, MapPin, Phone, Stethoscope, Upload, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type NutritionistAd = Database['public']['Tables']['nutritionist_ads']['Row'] & {
  profile_name?: string;
};

const ServiNUTRI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<NutritionistAd[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    specialty: '',
    phone_ddd: '',
    phone_number: '',
    photo_url: '',
    logo_url: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const specialties = [
    { value: 'nutricao_clinica', label: 'Nutrição Clínica' },
    { value: 'nutricao_esportiva', label: 'Nutrição Esportiva' },
    { value: 'nutricao_funcional', label: 'Nutrição Funcional' },
    { value: 'nutricao_estetica', label: 'Nutrição Estética' },
    { value: 'nutricao_materno_infantil', label: 'Nutrição Materno-Infantil' },
    { value: 'nutricao_hospitalar', label: 'Nutrição Hospitalar' },
    { value: 'nutricao_coletiva', label: 'Nutrição Coletiva' },
    { value: 'nutricao_saude_publica', label: 'Nutrição em Saúde Pública' }
  ];

  const dddOptions = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      // Primeiro buscar os anúncios
      const { data: adsData, error: adsError } = await supabase
        .from('nutritionist_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (adsError) throw adsError;

      // Depois buscar os perfis dos usuários
      const userIds = adsData?.map(ad => ad.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

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

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('nutritionist-ads')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('nutritionist-ads')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar um anúncio.",
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
        photoUrl = await uploadFile(photoFile, 'photos') || '';
      }

      // Upload da logo
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logos') || '';
      }

      const { error } = await supabase
        .from('nutritionist_ads')
        .insert({
          user_id: user.id,
          state: formData.state,
          city: formData.city,
          specialty: formData.specialty as any,
          phone_ddd: formData.phone_ddd,
          phone_number: formData.phone_number,
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
        state: '',
        city: '',
        specialty: '',
        phone_ddd: '',
        phone_number: '',
        photo_url: '',
        logo_url: ''
      });
      setPhotoFile(null);
      setLogoFile(null);
      setShowForm(false);
      fetchAds();
    } catch (error) {
      console.error('Erro ao cadastrar anúncio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o anúncio. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchTerm.trim()) {
      fetchAds();
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-nutritionists', {
        body: { searchTerm, ads }
      });

      if (error) throw error;
      setAds(data.filteredAds || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      // Fallback para busca simples
      const filtered = ads.filter(ad => 
        ad.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialties.find(s => s.value === ad.specialty)?.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.profile_name && ad.profile_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setAds(filtered);
    } finally {
      setSearchLoading(false);
    }
  };

  const getSpecialtyLabel = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.label || specialty;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">ServiNUTRI</h1>
          <p className="text-lg text-gray-600">Encontre nutricionistas especializados na sua região</p>
        </div>

        {/* Busca com IA */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Busque por especialidade, cidade, estado ou qualquer critério..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button 
                onClick={handleAISearch}
                disabled={searchLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                {searchLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card de Cadastro */}
        {!showForm && (
          <Card className="mb-8 border-2 border-dashed border-green-300 hover:border-green-500 transition-colors">
            <CardContent className="p-8 text-center">
              <UserPlus className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cadastrar Serviço</h3>
              <p className="text-gray-600 mb-4">Divulgue seu trabalho como nutricionista</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Cadastro */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastrar Anúncio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select value={formData.specialty} onValueChange={(value) => setFormData({...formData, specialty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ddd">DDD</Label>
                    <Select value={formData.phone_ddd} onValueChange={(value) => setFormData({...formData, phone_ddd: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="DDD" />
                      </SelectTrigger>
                      <SelectContent>
                        {dddOptions.map((ddd) => (
                          <SelectItem key={ddd} value={ddd}>
                            {ddd}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo">Foto Pessoal</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logomarca (Opcional)</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
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
          </Card>
        )}

        {/* Lista de Anúncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Card key={ad.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {ad.photo_url ? (
                    <img
                      src={ad.photo_url}
                      alt="Foto do nutricionista"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ad.profile_name || 'Nutricionista'}</h3>
                    {ad.logo_url && (
                      <img
                        src={ad.logo_url}
                        alt="Logo"
                        className="w-12 h-12 object-contain mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {ad.city}, {ad.state}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4" />
                    {getSpecialtyLabel(ad.specialty)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    ({ad.phone_ddd}) {ad.phone_number}
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => window.open(`https://wa.me/55${ad.phone_ddd}${ad.phone_number}`, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum anúncio encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiNUTRI;
