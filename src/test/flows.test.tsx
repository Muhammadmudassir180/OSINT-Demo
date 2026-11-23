import { describe, expect, it } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { seedJobs } from '../data/profiles';
import { AppProvider } from '../state/AppContext';
import { initialState } from '../state/reducer';
import { AppThemeProvider } from '../theme';

function renderAt(path: string) {
  return render(
    <AppThemeProvider>
      <AppProvider seed={initialState(seedJobs(Date.now()))}>
        <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </MemoryRouter>
      </AppProvider>
    </AppThemeProvider>,
  );
}

describe('Entity Search → crawl', () => {
  it('starts a crawl from a result and shows it running', async () => {
    const user = userEvent.setup();
    renderAt('/entity');
    await user.click(await screen.findByRole('button', { name: /Set up crawl for Mira Solenne, Facebook Users/ }, { timeout: 8000 }));
    const dialog = await screen.findByRole('dialog', { name: 'Set up crawl' });
    const limit = within(dialog).getByLabelText(/Number of items to crawl/);
    await user.clear(limit);
    await user.type(limit, '50');
    await user.click(within(dialog).getByRole('button', { name: 'Start crawl' }));
    expect(await screen.findByText(/started for Mira Solenne/)).toBeTruthy();
    expect(screen.getByText('9 crawls running')).toBeTruthy(); // the seed has 8
    // The dialog hides the page from assistive tech until its exit transition ends.
    const card = await screen.findByRole('button', { name: /Set up crawl for Mira Solenne/ }, { timeout: 3000 });
    expect(within(card).getByText(/^Crawling \d+%$/)).toBeTruthy();
  });

  it('requires at least one type of content to collect', async () => {
    const user = userEvent.setup();
    renderAt('/entity');
    await user.click(await screen.findByRole('button', { name: /Set up crawl for Mira Community Forum/ }, { timeout: 8000 }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Posts' }));
    await user.click(within(dialog).getByRole('button', { name: 'Start crawl' }));
    expect(within(dialog).getByText('Choose at least one type of content to collect.')).toBeTruthy();
    expect(screen.getByText('8 crawls running')).toBeTruthy();
  });

  it('username search on Facebook shows only the chosen category', async () => {
    const user = userEvent.setup();
    renderAt('/entity');
    await user.click(await screen.findByRole('radio', { name: /Username Search/ }, { timeout: 8000 }));
    await user.type(screen.getByLabelText('Social media username'), 'harbor.watch');
    await user.click(screen.getByRole('radio', { name: 'Groups' }));
    await user.click(screen.getByRole('button', { name: 'Search profiles' }));
    const group = await screen.findByRole('group', { name: 'Facebook groups' }, { timeout: 2000 });
    expect(within(group).getByText('Harbor Watch Collective')).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Facebook pages' })).toBeNull();
  });
});

describe('Shell', () => {
  it('top-bar search updates the Entity Search field when already on the page', async () => {
    const user = userEvent.setup();
    renderAt('/entity');
    const field = (await screen.findByLabelText('Person or entity name', {}, { timeout: 8000 })) as HTMLInputElement;
    expect(field.value).toBe('Mira');
    await user.type(screen.getByLabelText('Search profiles by name'), 'Helio{Enter}');
    await waitFor(() => expect(field.value).toBe('Helio'));
    expect(screen.getByText(/Exact username match|Name-based discovery · Helio/)).toBeTruthy();
  });


  it('switches the theme', async () => {
    const user = userEvent.setup();
    renderAt('/settings');
    await user.click(await screen.findByRole('button', { name: 'Switch to light theme' }, { timeout: 8000 }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeTruthy());
    expect(((await screen.findByRole('switch', { name: 'Dark appearance' }, { timeout: 8000 })) as HTMLInputElement).checked).toBe(false);
  });
});
