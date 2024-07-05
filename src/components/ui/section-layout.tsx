import React, { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SectionLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode[];
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({ children, className, ...rest }) => {
  return (
    <div className={cn(className)} {...rest}>
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <Separator />
          {child}
        </React.Fragment>
      ))}
    </div>
  );
};
