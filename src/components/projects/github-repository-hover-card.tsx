'use client';

import { useMemo, useState } from 'react';
import ReactPlayer from 'react-player';

import { AnimatePresence, motion } from 'framer-motion';
import { Github, Globe, Play, X } from 'lucide-react';
import Image from 'next/image';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface GitHubRepositoryHoverCardProps {
  className?: string;
  items: MbAwanProjects[];
}

export const GitHubRepositoryHoverCard: React.FC<GitHubRepositoryHoverCardProps> = ({ className, items }) => {
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
  const [selectedItem, setSelectedItem] = useState<MbAwanProjects | null>(null);

  const gridLayoutClass = useMemo(() => {
    const length = items.length;
    if (length === 3 || length === 6) {
      return 'lg:grid-cols-3';
    } else {
      return 'lg:grid-cols-2';
    }
  }, [items.length]);

  return (
    <>
      {/* Cards Grid */}
      <div className={cn('grid grid-cols-1 md:grid-cols-2', gridLayoutClass, className)}>
        {items.map((item, idx) => (
          <div
            className="group relative block size-full cursor-pointer p-2"
            key={item.repo ?? item.name}
            onClick={() => setSelectedItem(item)}
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
              <CardHeader className="p-0">
                {item?.thumbnail ? (
                  <Image
                    alt={item.name}
                    className="h-[200px] w-full rounded-t-md object-cover"
                    height={200}
                    src={item.thumbnail}
                    width={400}
                  />
                ) : (
                  <div className="h-[200px] w-full rounded-t-md bg-muted" />
                )}
                <CardTitle className="p-2 font-heading text-xl md:text-2xl">{item.name}</CardTitle>
              </CardHeader>

              <CardContent className="p-2">
                <CardDescription className="line-clamp-3">{item.description}</CardDescription>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-card p-4 text-card-foreground shadow-lg md:p-6"
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
            >
              {/* Close Button */}
              <button
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
                onClick={() => setSelectedItem(null)}
              >
                <X size={24} />
              </button>

              {/* Media */}
              <div className="mb-4 mt-6">
                {selectedItem.video ? (
                  <ReactPlayer
                    className="overflow-hidden rounded-lg"
                    controls
                    height="400px"
                    playing
                    src={selectedItem.video}
                    width="100%"
                  />
                ) : selectedItem.thumbnail ? (
                  <img alt={selectedItem.name} className="mx-auto rounded-lg" src={selectedItem.thumbnail} />
                ) : (
                  <div className="h-[300px] w-full rounded-lg bg-muted" />
                )}
              </div>

              {/* Title + Description */}
              <h2 className="mb-2 text-2xl font-bold">{selectedItem.name}</h2>
              <p className="mb-4 text-muted-foreground">{selectedItem.description}</p>

              {/* Technologies */}
              {selectedItem.technologies && selectedItem.technologies.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedItem.technologies.map((skill) => (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedItem.url && (
                  <Button onClick={() => window.open(selectedItem.url, '_blank')} variant="outline">
                    <Globe className="mr-2 size-4" /> Live Demo
                  </Button>
                )}
                {selectedItem.repo && (
                  <Button onClick={() => window.open(selectedItem.repo, '_blank')} variant="outline">
                    <Github className="mr-2 size-4" /> Repository
                  </Button>
                )}
                {selectedItem.video && (
                  <Button onClick={() => window.open(selectedItem.video, '_blank')} variant="outline">
                    <Play className="mr-2 size-4" /> Video Demo
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('relative z-20 size-full rounded-md bg-card text-card-foreground shadow-sm', className)}>
      <div className="relative z-50 flex flex-col space-y-1">{children}</div>
    </div>
  );
};
