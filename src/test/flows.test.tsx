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

describe('Intelligence Hub → Case files', () => {
  it('opens Case files and creates a folder with an uploaded image', async () => {
    URL.createObjectURL ??= () => 'blob:test-image'; // jsdom has no createObjectURL
    const user = userEvent.setup();
    renderAt('/hub');
    await user.click(await screen.findByRole('button', { name: 'Case files' }, { timeout: 8000 }));
    expect(await screen.findByText('Coastal Logistics Inquiries', {}, { timeout: 8000 })).toBeTruthy();
    await user.click(screen.getAllByRole('button', { name: /Create folder/ })[0]);
    const dialog = await screen.findByRole('dialog', { name: 'Create folder' });
    await user.type(within(dialog).getByLabelText(/Folder name/), 'Kenya maritime');
    await user.click(within(dialog).getByRole('button', { name: 'Create folder' }));
    expect(within(dialog).getByText('Upload an image for this folder.')).toBeTruthy();
    await user.upload(within(dialog).getByLabelText('Image file'), new File(['x'], 'flag.png', { type: 'image/png' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create folder' }));
    expect(await screen.findByText('Kenya maritime')).toBeTruthy();
    expect(screen.getByText('Folder created in Case files.')).toBeTruthy();
  });
});

describe('Intelligence Hub → Open investigation', () => {
  it('walks the brief and collection plan, adds a channel, and files the case', async () => {
    const user = userEvent.setup();
    renderAt('/hub');
    await user.click(await screen.findAllByRole('button', { name: /New investigation/ }, { timeout: 8000 }).then((b) => b[0]));
    let dialog = await screen.findByRole('dialog', { name: /Open investigation/ });
    await user.type(within(dialog).getByLabelText(/Case title/), 'Port strike watch');
    await user.type(within(dialog).getByLabelText(/Investigation objective/), 'Track public calls for the strike.');
    await user.click(within(dialog).getByRole('combobox', { name: /Archive folder/ }));
    await user.click(await screen.findByRole('option', { name: 'Port Authority Reviews' }));
    await user.click(within(dialog).getByRole('button', { name: 'Next' }));

    dialog = await screen.findByRole('dialog', { name: /Step 2 of 2/ });
    await user.type(within(dialog).getByLabelText(/Event of interest/), 'Dock strike');
    await user.type(within(dialog).getByLabelText('Hashtags'), 'portstrike{enter}');
    expect(within(dialog).getByText('#portstrike')).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Back' }));
    await user.click(within(await screen.findByRole('dialog', { name: /Step 1 of 2/ })).getByRole('button', { name: 'Next' }));
    dialog = await screen.findByRole('dialog', { name: /Step 2 of 2/ });
    expect(within(dialog).getByText('#portstrike')).toBeTruthy(); // Back and Next keep the plan
    await user.click(within(dialog).getByRole('button', { name: 'Launch investigation' }));
    expect(within(dialog).getByText('Choose at least one platform.')).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: /X \(Twitter\)/ }));

    await user.click(within(dialog).getByRole('button', { name: 'Add channel' }));
    const add = await screen.findByRole('dialog', { name: 'Add news channel' });
    await user.type(within(add).getByLabelText(/Channel name/), 'Harbor Times');
    await user.type(within(add).getByLabelText(/Website URL/), 'https://harbortimes.example');
    await user.click(within(add).getByRole('button', { name: 'Add channel' }));
    expect(await within(dialog).findByRole('button', { name: /Harbor Times/, pressed: true }, { timeout: 4000 })).toBeTruthy();

    await user.click(within(dialog).getByRole('button', { name: 'Launch investigation' }));
    expect(await screen.findByText('Investigation launched and filed in “Port Authority Reviews”.')).toBeTruthy();
    // Lands inside the chosen folder, which now lists the new case beside its 2 seed cases.
    expect(await screen.findByRole('heading', { name: 'Port Authority Reviews' }, { timeout: 8000 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Port strike watch' })).toBeTruthy();
    expect(screen.getByText(/^3 cases filed/)).toBeTruthy();
    await user.click(screen.getByRole('link', { name: /Case files/ }));
    const card = (await screen.findByAltText('Port Authority Reviews folder image', {}, { timeout: 8000 })).parentElement!;
    expect(within(card).getByText('3 cases')).toBeTruthy();
  }, 60000);
});

describe('Intelligence Hub board', () => {
  it('shows priority on cards and filters by status and search', async () => {
    const user = userEvent.setup();
    renderAt('/hub');
    expect((await screen.findAllByText('High priority', {}, { timeout: 8000 })).length).toBe(3); // 2 cards + the stat card
    await user.click(screen.getByRole('button', { name: /^Completed/ }));
    const titles = () => within(screen.getByRole('main')).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles()).toEqual(['Entity Relationship Mapping', 'Kestrel Analytics Source Validation', 'Cross-Platform Username Correlation']);
    await user.type(screen.getByRole('textbox', { name: 'Search cases' }), 'no such case');
    expect(screen.getByText('No cases match')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('heading', { name: 'Regional Freight Network Review' })).toBeTruthy();
  });
});
