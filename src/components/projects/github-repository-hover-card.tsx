'use client';

import { useMemo, useState } from 'react';
import ReactPlayer from 'react-player';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import { RenderIf } from '@/components/common/render-if';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface GitHubRepositoryHoverCardProps {
  className?: string;
  items: MbAwanProjects[];
}

export const GitHubRepositoryHoverCard: React.FC<GitHubRepositoryHoverCardProps> = ({ className, items }) => {
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);

  const gridLayoutClass = useMemo(() => {
    const length = items.length;
    if (length === 3 || length === 6) {
      return 'lg:grid-cols-3';
    } else {
      return 'lg:grid-cols-2';
    }
  }, [items.length]);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2', gridLayoutClass, className)}>
      {items.map((item, idx) => (
        <div
          className="group relative block size-full cursor-pointer p-2"
          key={item.repo ?? item.name}
          // onClick={() => {
          //   if (item.url) window.open(item.url, '_blank');
          //   else if (item.video) window.open(item.video, '_blank');
          // }}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                className="absolute inset-0 block size-full rounded-lg bg-card-foreground text-card-foreground shadow-sm"
                exit={{ opacity: 0, transition: { delay: 0.2, duration: 0.15 } }}
                initial={{ opacity: 0 }}
                layoutId="hoverBackground"
              />
            )}
          </AnimatePresence>

          <Card>
            <CardHeader className="h-[300px] w-full object-cover p-0">
              {item?.video && hoveredIndex === idx ? (
                // <video autoPlay className="h-[200px] w-full rounded-t-md object-cover" loop muted src={item.video} />
                <ReactPlayer
                  autoPlay={true}
                  className="h-[300px] w-full rounded-t-md object-cover"
                  height={200}
                  loop={true}
                  muted={false}
                  src={item.video}
                />
              ) : item?.thumbnail ? (
                <img alt={item.name} className="max-h-[270px] w-full rounded-t-md" src={item.thumbnail} />
              ) : (
                <div className="h-[300px] w-full rounded-t-md bg-muted" />
              )}
              <CardTitle className="font-heading text-xl md:text-2xl">
                <h2>{item.name}</h2>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <CardDescription>
                <RenderIf fallback={item?.description} when={item?.description?.length > 100}>
                  {`${item?.description?.substring(0, 100)}...`}
                </RenderIf>
              </CardDescription>

              {/* Demo Button */}
              {(item?.url || item?.video) && (
                <Button
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    window.open(item?.url ?? item?.video, '_blank');
                  }}
                  variant="outline"
                >
                  Live Demo
                </Button>
              )}

              {/* Repo Button */}
              {item?.repo && (
                <Button
                  className="ml-2 mt-2"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    window.open(item.repo, '_blank');
                  }}
                  variant="outline"
                >
                  Repository
                </Button>
              )}
            </CardContent>

            <CardFooter className="p-0" />
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('relative z-20 size-full rounded-md bg-card text-card-foreground shadow-sm', className)}>
      <div className="relative z-50">
        <div className="flex flex-col space-y-1">{children}</div>
      </div>
    </div>
  );
};
