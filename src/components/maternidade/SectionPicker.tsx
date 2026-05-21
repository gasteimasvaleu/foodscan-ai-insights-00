import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

export type SectionOption = { id: string; label: string };

type Props = {
  options: SectionOption[];
  value: string;
  onChange: (v: string) => void;
  title?: string;
  placeholder?: string;
  className?: string;
};

export function SectionPicker({ options, value, onChange, title = 'Selecionar seção', placeholder = 'Selecione', className }: Props) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.id === value);
  const activeLabel = active?.label ?? '';


  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full h-12 px-4 rounded-xl bg-white/70 backdrop-blur-md flex items-center justify-between text-base ${className ?? ''}`}
      >
        <span className={active ? 'text-[#FD46A1] font-medium' : 'text-gray-500'}>
          {active ? activeLabel : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-[#FD46A1]" />
      </button>


      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DrawerTitle className="px-4 pt-4 text-base">{title}</DrawerTitle>
          <div className="flex flex-col gap-2 p-4">
            {options.map((o) => {
              const isActive = o.id === value;
              return (
                <button
                  key={o.id}
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={`h-12 rounded-xl text-base px-4 flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#FD46A1] text-white' : 'bg-white/60 text-gray-800 hover:bg-white/80'
                  }`}
                >
                  <span>{o.label}</span>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
