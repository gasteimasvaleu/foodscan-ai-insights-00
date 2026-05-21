import * as React from 'react';
import {
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const GlassSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, ...props }, ref) => (
  <SelectTrigger
    ref={ref}
    className={cn(
      'h-12 rounded-xl bg-white/70 backdrop-blur-md border-0 text-base text-[#FD46A1] font-medium [&>svg]:text-[#FD46A1] [&>svg]:opacity-100',
      className,
    )}
    {...props}
  />
));
GlassSelectTrigger.displayName = 'GlassSelectTrigger';

export const GlassSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, ...props }, ref) => (
  <SelectContent
    ref={ref}
    className={cn(
      'bg-white/90 backdrop-blur-md border-2 border-primary rounded-2xl shadow-xl p-2',
      className,
    )}
    {...props}
  />
));
GlassSelectContent.displayName = 'GlassSelectContent';

export const GlassSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, ...props }, ref) => (
  <SelectItem
    ref={ref}
    className={cn(
      'text-base rounded-xl my-1 focus:bg-[#FD46A1] focus:text-white data-[state=checked]:bg-[#FD46A1] data-[state=checked]:text-white',
      className,
    )}
    {...props}
  />
));
GlassSelectItem.displayName = 'GlassSelectItem';
