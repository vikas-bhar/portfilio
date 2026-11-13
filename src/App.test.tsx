import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { SiteContext } from './context/site-context';
import { siteContentSchema } from './lib/site-schema';
import { defaultContent, navigation, profile, resumeFiles } from './data/portfolio';

vi.mock('./components/Ambient3DBackground', () => ({ default: () => null }));

describe('portfolio application', () => {
  it('renders the complete portfolio and valid navigation targets', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.headline);
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    navigation.forEach(({ id, label }) => {
      expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('href', `#${id}`);
      expect(document.getElementById(id)).toBeInTheDocument();
    });
    expect(document.querySelectorAll('#home img, #about-me img')).toHaveLength(0);
    expect(document.querySelector('.hero-portrait-frame, .about-portrait-frame')).toBeNull();
  });

  it('keeps admin off the page until the three-line menu opens', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Navbar onOpenResume={vi.fn()} theme="dark" onToggleTheme={vi.fn()} />
        <main>
          <h1>Public portfolio</h1>
        </main>
        <Footer />
      </>,
    );
    expect(screen.queryByRole('link', { name: 'Admin login' })).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/admin"]')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const menu = screen.getByRole('navigation', { name: 'Menu navigation' });
    const admin = within(menu).getByRole('link', { name: 'Admin login' });
    expect(admin).toHaveAttribute('href', '/admin');
    expect(admin).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link', { name: 'Admin login' })).toHaveLength(1);
    expect(
      within(screen.getByRole('contentinfo')).queryByRole('link', { name: 'Admin login' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close navigation menu' }));
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Admin login' })).not.toBeInTheDocument(),
    );
  });

  it('closes the three-line menu when clicking outside it', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Navbar onOpenResume={vi.fn()} theme="dark" onToggleTheme={vi.fn()} />
        <main>
          <h1>Public portfolio</h1>
        </main>
        <Footer />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('link', { name: 'Admin login' })).toBeInTheDocument();
    await user.click(screen.getByRole('heading', { level: 1 }));
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Admin login' })).not.toBeInTheDocument(),
    );
  });

  it('puts the requested CTAs and direct email / GitHub links in the hero and footer', () => {
    render(<App />);
    const hero = within(document.getElementById('home')!);
    expect(hero.getByRole('link', { name: 'View Featured Projects' })).toHaveAttribute(
      'href',
      '#project',
    );
    expect(hero.getByRole('link', { name: 'Get in Touch' })).toHaveAttribute('href', '#contact');
    expect(hero.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', profile.github);
    expect(hero.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
    expect(hero.getByText(profile.heroSummary)).toBeInTheDocument();
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', profile.github);
    expect(footer.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  });

  it('orders the showcase for a quick scan and includes capabilities and milestones', () => {
    render(<App />);
    expect(
      Array.from(document.querySelectorAll('main > section')).map((section) => section.id),
    ).toEqual(['home', 'project', 'my-skill', 'about-me', 'experience', 'contact']);
    expect(within(document.getElementById('my-skill')!).getAllByRole('article')).toHaveLength(4);
    const experience = within(document.getElementById('experience')!);
    expect(experience.getAllByRole('article')).toHaveLength(3);
    expect(experience.getByText('Vision Start / Zenastra Industries')).toBeInTheDocument();
    const about = within(document.getElementById('about-me')!);
    profile.about.forEach((paragraph) =>
      expect(
        about.getByText(
          (_, element) => element?.tagName === 'P' && element.textContent === paragraph,
        ),
      ).toBeInTheDocument(),
    );
  });

  it('uses the edited whole-site content, ordered visible sections, and appearance settings', () => {
    const modified = structuredClone(defaultContent);
    modified.profile.name = 'Edited Owner';
    modified.profile.email = 'owner@example.com';
    modified.profile.role = 'Product Engineer';
    modified.copy.workTitle = 'Selected builds.';
    modified.copy.footerTagline = 'An edited footer.';
    modified.settings.defaultTheme = 'light';
    modified.settings.animations = false;
    modified.settings.resumeEnabled = false;
    modified.sections = [
      modified.sections[0]!,
      modified.sections[5]!,
      modified.sections[1]!,
      modified.sections[2]!,
      modified.sections[3]!,
      modified.sections[4]!,
    ];
    modified.sections[3]!.visible = false;
    const content = siteContentSchema.parse(modified);
    render(
      <SiteContext.Provider
        value={{ content, revision: 'published', previewMode: false, loadError: null }}
      >
        <App />
      </SiteContext.Provider>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Edited Owner — Product Engineer',
    );
    expect(screen.getByRole('heading', { name: /Selected builds/ })).toBeInTheDocument();
    expect(screen.getByText('An edited footer.')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(
      document.querySelectorAll('[data-motion="floating"], [data-motion="tilt"]'),
    ).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Résumé' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View résumé' })).not.toBeInTheDocument();
    expect(document.getElementById('my-skill')).not.toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll('main > section')).map((section) => section.id),
    ).toEqual(['home', 'contact', 'project', 'about-me', 'experience']);
    expect(
      within(document.getElementById('home')!).getByRole('link', { name: content.profile.email }),
    ).toHaveAttribute('href', 'mailto:owner@example.com');
  });

  it('toggles the theme and persists the preference', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('loads a previously chosen theme', () => {
    localStorage.setItem('portfolio-theme', 'light');
    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('opens the navigation menu and closes it after choosing a section', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const nav = screen.getByRole('navigation', { name: 'Menu navigation' });
    await user.click(within(nav).getByRole('link', { name: /About/ }));
    await waitFor(() =>
      expect(screen.queryByRole('navigation', { name: 'Menu navigation' })).not.toBeInTheDocument(),
    );
  });

  it('closes the navigation menu with Escape and returns focus to its toggle', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveFocus();
  });

  it('opens an accessible résumé dialog with working download paths', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Résumé' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('link', { name: /Print \/ Save PDF/i })).toHaveAttribute(
      'href',
      resumeFiles.html,
    );
    expect(within(dialog).getByRole('link', { name: 'TXT' })).toHaveAttribute(
      'download',
      'Vikas_Bhardwaj_Resume.txt',
    );
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(within(dialog).getByRole('button', { name: 'Close résumé' }));
    expect(dialog).not.toHaveAttribute('open');
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('handles native dialog cancellation', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Résumé' }));
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('copies the résumé only after the clipboard succeeds', async () => {
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Résumé' }));
    await user.click(screen.getByRole('button', { name: 'Copy text' }));
    expect(clipboard).toHaveBeenCalledWith(expect.stringContaining(profile.name.toUpperCase()));
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });

  it('shows an honest fallback when clipboard access fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Denied'));
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Résumé' }));
    await user.click(screen.getByRole('button', { name: 'Copy text' }));
    expect(screen.getByText(/Copy unavailable. Please download/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
  });

  it('labels the email form clearly without claiming to deliver messages', () => {
    render(<App />);
    const form = screen.getByRole('form', { name: 'Contact Vikas' });
    expect(within(form).getByRole('button', { name: 'Open email draft' })).toBeInTheDocument();
    expect(within(form).getByLabelText(/Email address/)).toBeRequired();
    expect(within(form).getByLabelText(/What are you thinking/)).toHaveAttribute('minlength', '10');
    expect(within(form).getByText(/Nothing is sent or stored/)).toBeInTheDocument();
  });
});
