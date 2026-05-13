import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LucideIcon, Apple, UtensilsCrossed, Users, ChevronRight, BarChart3, MessageCircle, Heart, Droplets, Timer, Target, Moon, ChefHat, Shirt, ShoppingBag, ShoppingCart, Repeat, Dumbbell, Baby, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

const moreSheetItems = [
  {
    name: "Registrar refeição",
    description: "Repetir refeição de ontem ou favoritos em 1 toque",
    url: "/adicionar-refeicao",
    icon: Repeat,
  },
  {
    name: "Alimentos brasileiros",
    description: "Busca em catálogo de arroz, feijão, açaí e mais",
    url: "/alimentos",
    icon: Apple,
  },
  {
    name: "NutriCoach",
    description: "Chat com IA de nutrição e treinos",
    url: "/nutri-coach",
    icon: MessageCircle,
  },
  {
    name: "Gráficos e Progresso",
    description: "Acompanhe sua evolução",
    url: "/graficos-progresso",
    icon: BarChart3,
  },
  {
    name: "Comunidade",
    description: "Compartilhe sua jornada fitness",
    url: "/comunidade",
    icon: Users,
  },
  {
    name: "Receitas",
    description: "Buscar receitas e gerenciar suas próprias",
    url: "/receitas",
    icon: UtensilsCrossed,
  },
  {
    name: "Faça em Casa",
    description: "Identifique pratos por foto e gere receitas caseiras",
    url: "/faca-em-casa",
    icon: ChefHat,
  },
  {
    name: "Provador Virtual",
    description: "Experimente looks com IA em fundo de estúdio",
    url: "/provador",
    icon: Shirt,
  },
  {
    name: "Loja",
    description: "Produtos selecionados de parceiros",
    url: "/loja",
    icon: ShoppingBag,
  },
  {
    name: "Lista de Compras",
    description: "Organize suas compras de mercado por categoria",
    url: "/lista-de-compras",
    icon: ShoppingCart,
  },
  {
    name: "ServiNUTRI",
    description: "Rede de nutricionistas",
    url: "/servinutri",
    icon: Apple,
  },
  {
    name: "Apple Health",
    description: "Dados detalhados de saúde e atividade",
    url: "/apple-health",
    icon: Heart,
  },
  {
    name: "Hidratação",
    description: "Registre bebidas e acompanhe seu progresso",
    url: "/hidratacao",
    icon: Droplets,
  },
  {
    name: "Jejum Intermitente",
    description: "Controle seus ciclos de jejum",
    url: "/jejum",
    icon: Timer,
  },
  {
    name: "Objetivos",
    description: "Monitore suas metas semanais",
    url: "/objetivos",
    icon: Target,
  },
  {
    name: "Sono",
    description: "Registre e acompanhe a qualidade do sono",
    url: "/sono",
    icon: Moon,
  },
  {
    name: "Maternidade",
    description: "Tentantes, gestação, pós-parto e bebê",
    url: "/maternidade",
    icon: Baby,
  },
  {
    name: "Treinos",
    description: "Vídeos de treino e dicas em casa",
    url: "/treinos",
    icon: Dumbbell,
  },
  {
    name: "Quiz",
    description: "Responda quizzes, ganhe pontos e dispute o ranking",
    url: "/quiz",
    icon: HelpCircle,
  },
  {
    name: "Gerar Cardápio",
    description: "Cardápios personalizados com IA (MasterCheFIT)",
    url: "/masterchef",
    icon: UtensilsCrossed,
  },
]

export function TubelightNavbar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

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
          "fixed bottom-2 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] md:max-w-none pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        <div className="absolute inset-x-0 -top-3 -bottom-2 bg-white -z-10" />
        <div className="flex items-center gap-2 sm:gap-3 bg-[#FA1690]/85 border border-white/20 backdrop-blur-lg py-2 px-2 sm:px-3 rounded-2xl shadow-none">
          {items.map((item) => {
            const Icon = item.icon
            const isMore = item.url === "#more"
            const isActive = !isMore && location.pathname === item.url

            return isMore ? (
              <button
                key={item.name}
                onClick={(e) => handleItemClick(item, e)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-3 sm:px-4 py-3 sm:py-2 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center",
                  "text-white/80 hover:text-white",
                  moreSheetOpen && "bg-white/20 text-white",
                )}
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
                  "relative cursor-pointer text-sm font-semibold px-3 sm:px-4 py-3 sm:py-2 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center",
                  "text-white/80 hover:text-white",
                  isActive && "bg-white/20 text-white",
                )}
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
                      stiffness: 300,
                      damping: 30,
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

      <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-t border-[#FA1690]/20 p-0">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <div className="px-4 pb-6 pt-2 space-y-3">
            <h3 className="text-lg font-bold text-foreground px-1">Mais opções</h3>

            {moreSheetItems.map((sheetItem) => {
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
