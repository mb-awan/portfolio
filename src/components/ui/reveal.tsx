'use client';

import { useEffect, useRef } from 'react';

import { HTMLMotionProps, motion, useAnimation, useInView } from 'framer-motion';

import { cn } from '@/lib/utils';

interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const Reveal = ({ children, className, ...props }: RevealProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      animate={controls}
      className={cn(className)}
      initial="hidden"
      ref={ref}
      transition={{ duration: 0.3 }}
      variants={{
        hidden: { opacity: 0, scale: 0 },
        visible: { opacity: 1, scale: 1 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
