import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] relative bottom-px font-medium tracking-wide transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-white/[0.06] text-neutral-200',
        secondary: 'border-transparent bg-white/[0.04] text-neutral-300',
        destructive: 'border-transparent bg-red-500/10 text-red-400',
        outline: 'text-neutral-400 border-white/[0.08]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
