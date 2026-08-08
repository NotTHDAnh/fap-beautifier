import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/lib/utils';
import { useSettings } from '@/app/providers/settings-provider';

const containerVariants = cva('w-full max-w-full px-4 lg:px-6', {
  variants: {
    width: {
      fixed: 'w-full max-w-full',
      fluid: 'w-full max-w-full',
    },
  },
  defaultVariants: {
    width: 'fluid',
  },
});

export interface ContainerProps extends VariantProps<typeof containerVariants> {
  children?: ReactNode;
  width?: 'fixed' | 'fluid';
  className?: string;
}

export function Container({ children, width, className = '' }: ContainerProps) {
  const { settings } = useSettings();
  const effectiveWidth = width ?? settings.container ?? 'fixed';

  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ width: effectiveWidth }), className)}
    >
      {children}
    </div>
  );
}
