import { CardDescription } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';

export function About() {
  return (
    <section className="container space-y-4" data-testid="about-section">
      <h2 className="text-3xl lg:text-4xl" id="about-section">
        About Me
      </h2>
      <Reveal
        transition={{ duration: 0.4 }}
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        }}
      >
        <CardDescription className="space-y-4 text-foreground">
          <p>Hi 👋 I&apos;m a software engineer, PUCITian, MERN Stack Developer and based in Lahore, Pakistan</p>
          <p>As a Pakistani, I strive to succeed and push my legacy forward through my work and personal projects.</p>

          <p>
            As a software engineer, I have experience in building web applications specially focused on the web SAAS
            applications in MERN stack, chrome extensions, and webflow designer extensions and hybrid apps.
          </p>
        </CardDescription>
      </Reveal>
    </section>
  );
}
