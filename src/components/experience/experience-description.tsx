'use client';

import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface ExperienceDescriptionProps {
  description: string;
}

export const ExperienceDescription: React.FC<ExperienceDescriptionProps> = ({ description }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDescription = () => {
    setIsOpen(!isOpen);
  };

  if (description.length < 100) {
    return <CardDescription className="text-foreground">{description}</CardDescription>;
  }

  return (
    <Collapsible className="w-full" onOpenChange={setIsOpen} open={isOpen}>
      {!isOpen && (
        <CardDescription className="text-foreground">{`${description.substring(0, 100)}...`}</CardDescription>
      )}

      <CollapsibleContent>
        <CardDescription className="text-foreground">{description}</CardDescription>
      </CollapsibleContent>

      <CollapsibleTrigger asChild>
        <Button
          className={cn('mt-1.5 inline-flex size-fit items-center gap-1 rounded-md p-1.5 text-xs/3 font-normal')}
          onClick={toggleDescription}
          variant={'outline'}
        >
          {!isOpen ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          {!isOpen ? 'View More' : 'View Less'}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
};
