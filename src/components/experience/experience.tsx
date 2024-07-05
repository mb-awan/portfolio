import { TracingBeam } from '@/components/ui/tracing-beam';

import { ExperienceCard } from './experience-card';
import { experiences } from './experience-config';

export function Experience() {
  return (
    <section className="flex flex-col items-start justify-start gap-4 md:mx-16" data-testid="experience-section">
      <TracingBeam className="flex flex-col">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl lg:text-4xl" id="experience-section">
            I&apos;ve Worked As:
          </h1>
          {experiences.map((experience, idx) => (
            <ExperienceCard
              company={experience.company}
              date={experience.date}
              description={experience.description}
              employmentType={experience.employmentType}
              image={experience.image}
              index={idx}
              key={`${experience.title}-${idx}`}
              skills={experience.skills}
              title={experience.title}
            />
          ))}
        </div>
      </TracingBeam>
    </section>
  );
}
