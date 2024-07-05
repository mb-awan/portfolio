'use client';

import React, { useEffect, useRef, useState } from 'react';

import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

import { cn, fullConfig } from '@/lib/utils';

export const TracingBeam = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ['start start', 'end start'],
    target: ref,
  });

  // track velocity of scroll to increase or decrease distance between svg gradient y coordinates.
  const scrollYProgressVelocity = useVelocity(scrollYProgress);
  const [, setVelocity] = React.useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        const newHeight = contentRef.current.offsetHeight;

        // Define minimum and maximum allowed heights
        const minHeight = 0; // Set this to whatever is appropriate for your layout
        const maxHeight = 2900; // Set this to whatever is appropriate for your layout

        // Constrain newHeight to be within minHeight and maxHeight
        const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
        setSvgHeight(constrainedHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Set initial SVG Height
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return scrollYProgress.on('change', setVelocity);
  }, [scrollYProgress, scrollYProgressVelocity]);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), {
    damping: 90,
    stiffness: 500,
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 0.3], [50, svgHeight - 200]), {
    damping: 90,
    stiffness: 500,
  });

  return (
    <motion.div className={cn('relative mx-auto h-full w-full max-w-4xl', className)} ref={ref}>
      <div className="absolute -left-4 top-3 hidden md:-left-20 md:inline-block">
        <motion.div
          animate={{
            boxShadow: scrollYProgress.get() > 0 ? 'none' : 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
          }}
          className="ml-[27px] flex size-4 items-center justify-center rounded-full border border-neutral-200 shadow-sm"
          transition={{ delay: 0.5, duration: 0.2 }}
        >
          <motion.div
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0
                  ? fullConfig.theme.colors.foreground
                  : fullConfig.theme.colors.primary.DEFAULT,
              borderColor:
                scrollYProgress.get() > 0
                  ? fullConfig.theme.colors.foreground
                  : fullConfig.theme.colors.primary.DEFAULT,
            }}
            className="size-2 rounded-full border border-neutral-300 bg-white"
            transition={{ delay: 0.5, duration: 0.2 }}
          />
        </motion.div>
        <svg
          aria-hidden="true"
          className="ml-4 block"
          height={svgHeight} // Set the SVG height
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            className="motion-reduce:hidden"
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <defs>
            <motion.linearGradient
              gradientUnits="userSpaceOnUse"
              id="gradient"
              x1="0"
              x2="0"
              y1={y1} // set y1 for gradient
              y2={y2} // set y2 for gradient
            >
              <stop stopColor={fullConfig.theme.colors.primary.DEFAULT} stopOpacity="0"></stop>
              <stop stopColor={fullConfig.theme.colors.primary.DEFAULT}></stop>
              <stop offset="0.325" stopColor={fullConfig.theme.colors.primary.DEFAULT}></stop>
              <stop offset="1" stopColor={fullConfig.theme.colors.primary.DEFAULT} stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};
