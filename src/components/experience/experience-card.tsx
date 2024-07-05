import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';

import { calculateExperienceDuration } from './experience-config';
import { ExperienceDescription } from './experience-description';

interface ExperienceCardProps extends ExperienceItem {
  index: number;
}

export function ExperienceCard({
  company,
  date,
  description,
  employmentType,
  image,
  index,
  skills,
  title,
}: ExperienceCardProps) {
  const duration = calculateExperienceDuration(date);

  return (
    <Card className="w-full">
      <CardHeader>
        {image && (
          <Image
            alt="Company Logo"
            className="mb-4 animate-reveal rounded-lg object-cover"
            height="900"
            loading={index < 1 ? 'eager' : 'lazy'}
            src={image}
            width="900"
          />
        )}

        <CardTitle className="font-heading text-xl md:text-2xl">
          <h2>{title}</h2>
        </CardTitle>

        <CardDescription className="text-sm text-foreground md:text-sm">
          {company} · {employmentType}
          <div className="text-muted">
            {date.start} - {date.end} ({duration})
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Reveal
          transition={{ duration: 0.4 }}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <ExperienceDescription description={description} />
        </Reveal>
      </CardContent>

      <CardFooter>
        {skills && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Reveal
                key={skill}
                transition={{ delay: index / 40, duration: 0.1 }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Badge className="rounded-md">{skill}</Badge>
              </Reveal>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
