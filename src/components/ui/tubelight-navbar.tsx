import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function TubelightNavbar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Update active tab based on current route
    const currentItem = items.find(item => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, items])

  return (
    <div
      className={cn(
        "fixed bottom-2 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] md:max-w-none pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {/* Faixa decorativa atrás do menu */}
      <div className="absolute -inset-x-6 -top-3 -bottom-4 bg-white rounded-t-3xl -z-10" />
      <div className="flex items-center gap-2 sm:gap-3 bg-[#FA1690]/85 border border-white/20 backdrop-blur-lg py-2 px-2 sm:px-3 rounded-2xl shadow-none">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.url

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
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
  )
}