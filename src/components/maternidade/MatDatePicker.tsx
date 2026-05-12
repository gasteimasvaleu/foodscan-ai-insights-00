import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DatePickerProps = {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
};

const parseLocal = (v: string): Date | undefined => {
  if (!v) return undefined;
  try {
    return parseISO(v.length === 10 ? v + 'T00:00:00' : v);
  } catch {
    return undefined;
  }
};

const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

export function MatDatePicker({ value, onChange, placeholder = 'Selecionar data', className, disabled }: DatePickerProps) {
  const date = parseLocal(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full h-12 rounded-xl bg-white text-base font-normal justify-between px-4 text-left border border-input',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {date ? format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 opacity-60 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={date}
          onSelect={(d) => d && onChange(toYMD(d))}
          disabled={disabled}
          initialFocus
          className={cn('p-3 pointer-events-auto')}
        />
      </PopoverContent>
    </Popover>
  );
}

type DateTimePickerProps = {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  className?: string;
};

const splitDateTime = (v: string) => {
  if (!v) return { date: '', time: '' };
  const [d, t = ''] = v.split('T');
  return { date: d || '', time: t.slice(0, 5) };
};

const joinDateTime = (date: string, time: string) => {
  if (!date) return '';
  return `${date}T${time || '00:00'}`;
};

export function MatDateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const { date, time } = splitDateTime(value);
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-1">
        <MatDatePicker
          value={date}
          onChange={(d) => onChange(joinDateTime(d, time))}
        />
      </div>
      <Input
        type="time"
        value={time}
        onChange={(e) => onChange(joinDateTime(date || new Date().toISOString().slice(0, 10), e.target.value))}
        className="text-base h-12 rounded-xl appearance-none text-left w-[110px]"
      />
    </div>
  );
}
