import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LucideIcon, Apple, UtensilsCrossed, Users, ChevronRight, BarChart3, MessageCircle, Heart, Droplets, Timer, Target, Moon, ChefHat, Shirt, ShoppingBag, ShoppingCart, Repeat, Dumbbell, Baby, HelpCircle, Trophy, CalendarCheck, Lock, Crown, Instagram, MapPin, Store, Truck, Sparkles, Wallet, Music } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuthContext } from "@/contexts/AuthProvider"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

const moreSheetItems: Array<{
  name: string
  description: string
  url: string
  icon: LucideIcon
  isPro: boolean
  isExtra?: boolean
}> = [
  { name: "Registrar refeição", description: "Repetir refeição de ontem ou favoritos em 1 toque", url: "/adicionar-refeicao", icon: Repeat, isPro: false },
  
  { name: "Comunidade", description: "Compartilhe sua jornada fitness", url: "/comunidade", icon: Users, isPro: false, isExtra: true },
  { name: "Tô Aqui", description: "Bares, restaurantes e festas com chat ao vivo no local", url: "/to-aqui", icon: MapPin, isPro: false, isExtra: true },
  { name: "Loja", description: "Produtos selecionados de parceiros", url: "/loja", icon: ShoppingBag, isPro: false },
  { name: "Mercado Fácil", description: "Mercado, hortifrúti e padaria com pedido pelo WhatsApp", url: "/mercado-facil", icon: ShoppingCart, isPro: false, isExtra: true },
  { name: "Finanças", description: "Controle suas receitas, despesas e o saldo do mês", url: "/financas", icon: Wallet, isPro: false, isExtra: true },
  { name: "Lista de Compras", description: "Organize suas compras de mercado por categoria", url: "/lista-de-compras", icon: ShoppingCart, isPro: false },
  { name: "ServiNUTRI", description: "Rede de nutricionistas", url: "/servinutri", icon: Apple, isPro: false },
  { name: "Maternidade", description: "Tentantes, gestação, pós-parto e bebê", url: "/maternidade", icon: Baby, isPro: false, isExtra: true },
  { name: "Quiz", description: "Responda quizzes, ganhe pontos e dispute o ranking", url: "/quiz", icon: HelpCircle, isPro: false },
  { name: "Desafio 14 dias", description: "Cardápio, vídeos e checklist para 14 dias de transformação", url: "/desafio-14-dias", icon: CalendarCheck, isPro: false },
  { name: "Conquistas", description: "Sequência diária e medalhas desbloqueadas", url: "/conquistas", icon: Trophy, isPro: false },

  { name: "NutriCoach", description: "Chat com IA de nutrição e treinos", url: "/nutri-coach", icon: MessageCircle, isPro: true },
  { name: "Gerar Cardápio", description: "Cardápios personalizados com IA (MasterCheFIT)", url: "/masterchef", icon: UtensilsCrossed, isPro: true },
  { name: "Receitas", description: "Buscar receitas e gerenciar suas próprias", url: "/receitas", icon: UtensilsCrossed, isPro: true },
  { name: "Faça em Casa", description: "Identifique pratos por foto e gere receitas caseiras", url: "/faca-em-casa", icon: ChefHat, isPro: true },
  { name: "Provador Virtual", description: "Experimente looks com IA em fundo de estúdio", url: "/provador", icon: Shirt, isPro: true, isExtra: true },
  { name: "Gráficos e Progresso", description: "Acompanhe sua evolução", url: "/graficos-progresso", icon: BarChart3, isPro: true },
  { name: "Apple Health", description: "Dados detalhados de saúde e atividade", url: "/apple-health", icon: Heart, isPro: true },
  { name: "Hidratação", description: "Registre bebidas e acompanhe seu progresso", url: "/hidratacao", icon: Droplets, isPro: true },
  { name: "Jejum Intermitente", description: "Controle seus ciclos de jejum", url: "/jejum", icon: Timer, isPro: true },
  { name: "Objetivos", description: "Monitore suas metas semanais", url: "/objetivos", icon: Target, isPro: true },
  { name: "Sono", description: "Registre e acompanhe a qualidade do sono", url: "/sono", icon: Moon, isPro: true },
  { name: "Treinos", description: "Vídeos de treino e dicas em casa", url: "/treinos", icon: Dumbbell, isPro: true },
  { name: "Nutricionista que Vende", description: "Crie posts para Instagram com IA — imagem, legenda e hashtags", url: "/nutricionista-que-vende", icon: Instagram, isPro: true, isExtra: true },
]

export function TubelightNavbar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { subscriptionStatus } = useAuthContext()
  const isPro = !!subscriptionStatus?.subscribed

  const extrasItems = moreSheetItems.filter((i) => i.isExtra)
  const freeItems = moreSheetItems.filter((i) => !i.isPro && !i.isExtra)
  const proItems = moreSheetItems.filter((i) => i.isPro && !i.isExtra)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const currentItem = items.find(item => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, items])

  const handleItemClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.url === "#more") {
      e.preventDefault()
      setMoreSheetOpen(true)
    } else {
      setActiveTab(item.name)
    }
  }

  const handleSheetNavigate = (url: string) => {
    setMoreSheetOpen(false)
    navigate(url)
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] md:max-w-none pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        <div
          className={cn(
            "relative flex items-center gap-1.5 sm:gap-2 backdrop-blur-md py-2 px-2 sm:px-2.5 rounded-2xl overflow-hidden",
            "bg-[#FA1690]/85 border border-white/30",
          )}
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.5), 0 0 18px rgba(255,255,255,0.45), 0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1), inset 1.5px 1.5px 0.5px rgba(255,255,255,0.55), inset -1px -1px 0.5px rgba(255,255,255,0.35)",
          }}
        >


          {/* Specular highlight (top sheen) */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Items */}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2.5">
          {items.map((item) => {
            const Icon = item.icon
            const isMore = item.url === "#more"
            const isActive = !isMore && location.pathname === item.url

            return isMore ? (
              <button
                key={item.name}
                onClick={(e) => handleItemClick(item, e)}
                  className={cn(
                    "relative cursor-pointer text-sm font-semibold px-3 sm:px-3 py-3 sm:py-2 rounded-2xl min-h-[48px] min-w-[48px] flex items-center justify-center",
                    "text-white/90 hover:text-white active:scale-110",
                  "transition-all duration-500",
                  moreSheetOpen && "bg-white/20 text-white",
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)" }}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={26} strokeWidth={2.5} />
                </span>
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.url}
                onClick={(e) => handleItemClick(item, e)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-3 sm:px-3 py-3 sm:py-2 rounded-2xl min-h-[48px] min-w-[48px] flex items-center justify-center",
                  "text-white/90 hover:text-white active:scale-110",
                  "transition-all duration-500",
                  isActive && "bg-white/20 text-white",
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)" }}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={26} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-white/10 rounded-2xl -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full">
                      <div className="absolute w-12 h-6 bg-white/30 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-white/30 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
          </div>
        </div>
      </div>



      <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-t border-[#FA1690]/20 p-0">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <div className="px-4 pb-6 pt-2 space-y-4">
            {/* Recursos Extras (azul) */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Sparkles size={18} className="text-[#2563EB]" />
                <h3 className="text-lg font-bold text-[#2563EB]">Recursos Extras</h3>
              </div>
              {extrasItems.map((sheetItem) => {
                const SheetIcon = sheetItem.icon
                const locked = sheetItem.isPro && !isPro
                return (
                  <button
                    key={sheetItem.url}
                    onClick={() => handleSheetNavigate(sheetItem.url)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <SheetIcon size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{sheetItem.name}</p>
                        {sheetItem.isPro && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#FD46A1] px-1.5 py-0.5 rounded">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{sheetItem.description}</p>
                    </div>
                    {locked ? (
                      <Lock size={18} className="text-[#FD46A1] flex-shrink-0" />
                    ) : (
                      <ChevronRight size={20} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </section>

            {/* Free section */}
            <section className="space-y-3 pt-2">
              <h3 className="text-lg font-bold text-foreground px-1">Mais opções</h3>
              {freeItems.map((sheetItem) => {
                const SheetIcon = sheetItem.icon
                return (
                  <button
                    key={sheetItem.url}
                    onClick={() => handleSheetNavigate(sheetItem.url)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#FFD1E7]/40 border border-[#FA1690]/10 hover:bg-[#FFD1E7]/60 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FD46A1]/15 flex items-center justify-center flex-shrink-0">
                      <SheetIcon size={24} className="text-[#FD46A1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">{sheetItem.name}</p>
                      <p className="text-sm text-muted-foreground">{sheetItem.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
                  </button>
                )
              })}
            </section>

            {/* Premium section */}
            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <Crown size={18} className="text-[#FD46A1]" />
                <h3 className="text-lg font-bold text-foreground">Premium</h3>
                {!isPro && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#FD46A1] bg-[#FD46A1]/10 px-2 py-0.5 rounded-full">
                    Bloqueado
                  </span>
                )}
              </div>
              {proItems.map((sheetItem) => {
                const SheetIcon = sheetItem.icon
                const locked = !isPro
                return (
                  <button
                    key={sheetItem.url}
                    onClick={() => handleSheetNavigate(sheetItem.url)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors text-left",
                      locked
                        ? "bg-white/60 border-[#FD46A1]/25 hover:bg-white/80"
                        : "bg-[#FFD1E7]/40 border-[#FA1690]/10 hover:bg-[#FFD1E7]/60"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative",
                      locked ? "bg-[#FD46A1]/10" : "bg-[#FD46A1]/15"
                    )}>
                      <SheetIcon size={24} className={cn(locked ? "text-[#FD46A1]/70" : "text-[#FD46A1]")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("font-bold", locked ? "text-foreground/80" : "text-foreground")}>
                          {sheetItem.name}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#FD46A1] px-1.5 py-0.5 rounded">
                          Pro
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{sheetItem.description}</p>
                    </div>
                    {locked ? (
                      <Lock size={18} className="text-[#FD46A1] flex-shrink-0" />
                    ) : (
                      <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
