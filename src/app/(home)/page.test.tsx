import { render, screen } from '@testing-library/react';

import Page from '@/app/(home)/page';

describe('Home Component', () => {
  it('renders the component successfully', async () => {
    const view = render(await Page());
    expect(view.container).toBeInTheDocument();
  });

  it('renders the hero section', async () => {
    render(await Page());
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders the about section', async () => {
    render(await Page());
    expect(screen.getByTestId('about-section')).toBeInTheDocument();
  });

  it('renders the experience section', async () => {
    render(await Page());
    expect(screen.getByTestId('experience-section')).toBeInTheDocument();
  });

  it('renders the project section', async () => {
    render(await Page());
    expect(screen.getByTestId('project-section')).toBeInTheDocument();
  });
});
