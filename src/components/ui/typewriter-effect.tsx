'use client';

import { Typewriter, TypewriterProps } from 'react-simple-typewriter';

export const TypewriterEffect = (props: TypewriterProps) => {
  return <Typewriter cursor cursorBlinking delaySpeed={1000} deleteSpeed={50} loop={0} typeSpeed={100} {...props} />;
};
