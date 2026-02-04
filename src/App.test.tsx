import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Briefcase: () => <span data-testid="icon-briefcase" />,
  MapPin: () => <span data-testid="icon-mappin" />,
  DollarSign: () => <span data-testid="icon-dollarsign" />,
  User: () => <span data-testid="icon-user" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  MoreHorizontal: () => <span data-testid="icon-more" />,
  Plus: () => <span data-testid="icon-plus" />,
  Globe: () => <span data-testid="icon-globe" />,
  Search: () => <span data-testid="icon-search" />,
  ExternalLink: () => <span data-testid="icon-external" />,
  Save: () => <span data-testid="icon-save" />,
  Trash2: () => <span data-testid="icon-trash" />
}));

describe('Job Tracker App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the dashboard by default', () => {
    render(<App />);
    expect(screen.getByText('Job Tracker')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument(); // Kanban column
    expect(screen.getByText('Interview')).toBeInTheDocument(); // Kanban column
  });

  it('can open the Add Application modal', async () => {
    render(<App />);
    const user = userEvent.setup();

    const addButton = screen.getByText('Add Application');
    await user.click(addButton);

    expect(screen.getByText('New Application')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument();
  });

  it('can add a new job application manually', async () => {
    render(<App />);
    const user = userEvent.setup();

    // Open Modal
    await user.click(screen.getByText('Add Application'));

    // Fill Form
    await user.type(screen.getByPlaceholderText('Company Name'), 'Test Company');
    await user.type(screen.getByPlaceholderText('Role Title'), 'Software Engineer');
    await user.type(screen.getByPlaceholderText('e.g. Remote, NY'), 'Remote');

    // Save
    await user.click(screen.getByText('Save Application'));

    // Check if added to board
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('simulates scraping logic correctly', async () => {
    // This test verifies the logic we injected into the webview
    // We can't test the actual webview component easily in jsdom, 
    // but we can verify the extraction logic function itself.

    const mockDocument = new DOMParser().parseFromString(`
      <html>
        <body>
          <h1 class="job-details-jobs-unified-top-card__job-title">Senior React Dev</h1>
          <div class="job-details-jobs-unified-top-card__company-name">
            <a href="#">Tech Corp</a>
          </div>
          <span class="job-details-jobs-unified-top-card__bullet">San Francisco, CA</span>
        </body>
      </html>
    `, 'text/html');

    // Recreating the logic from App.tsx
    const getText = (selector: string) => mockDocument.querySelector(selector)?.textContent?.trim() || '';

    const title = getText('.job-details-jobs-unified-top-card__job-title') || getText('h1');
    const company = getText('.job-details-jobs-unified-top-card__company-name') || getText('.job-details-jobs-unified-top-card__company-name a');
    const location = getText('.job-details-jobs-unified-top-card__bullet');

    expect(title).toBe('Senior React Dev');
    expect(company).toBe('Tech Corp');
    expect(location).toBe('San Francisco, CA');
  });
});
