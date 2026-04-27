'use client';

import React, { forwardRef, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = {
  inputClassName?: string;
} & Omit<React.ComponentProps<typeof Input>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, id, inputClassName, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const inputRoundedXl = Boolean(inputClassName && String(inputClassName).includes('rounded-xl'));

  return (
    <div className={cn('relative', className)}>
      <Input
        className={cn('h-11 pe-10', inputClassName)}
        id={id}
        ref={ref}
        type={show ? 'text' : 'password'}
        {...props}
      />
      <button
        aria-label={show ? 'Hide password' : 'Show password'}
        className={cn(
          'absolute bottom-0 end-0 top-0 z-[1] flex w-10 items-center justify-center',
          'border border-transparent bg-transparent text-muted-foreground transition-colors',
          'hover:bg-foreground/[0.06] hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'active:bg-foreground/[0.1]',
          'dark:hover:bg-white/10 dark:active:bg-white/[0.14]',
          inputRoundedXl ? 'rounded-r-xl' : 'rounded-r-md'
        )}
        onClick={() => setShow((s) => !s)}
        type="button"
      >
        {show ? <EyeOff className="size-4" strokeWidth={1.75} /> : <Eye className="size-4" strokeWidth={1.75} />}
      </button>
    </div>
  );
});
