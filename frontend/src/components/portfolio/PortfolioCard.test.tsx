import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PortfolioCard from './PortfolioCard';
import { useAuth } from '../../context/AuthContext';
import { useAiReview } from '../../context/AiReviewContext';
import { aiReviewService } from '../../services/aiReviewService';

// Mock the context hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../context/AiReviewContext', () => ({
  useAiReview: vi.fn(),
}));

vi.mock('../../services/aiReviewService', () => ({
  aiReviewService: {
    triggerReview: vi.fn(),
  },
}));

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PortfolioCard Component', () => {
  const mockPortfolio = {
    id: 42,
    url: 'https://testportfolio.com',
    description: 'A mock description for test portfolio.',
    screenshot: null,
    gitRepo: 'https://github.com/mock/repo',
    userId: 1,
    username: 'owner_user',
    fullName: 'Owner Full Name',
    feedbackCount: 5,
    createdAt: '2026-06-03T12:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders portfolio information correctly', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 2, username: 'other_user', role: 'USER' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      token: null,
    });

    vi.mocked(useAiReview).mockReturnValue({
      activeReview: null,
      setActiveReview: vi.fn(),
      checkLatestReviewStatus: vi.fn(),
    });

    render(
      <BrowserRouter>
        <PortfolioCard portfolio={mockPortfolio} />
      </BrowserRouter>
    );

    expect(screen.getByText("Owner Full Name's Portfolio")).toBeInTheDocument();
    expect(screen.getByText("by")).toBeInTheDocument();
    expect(screen.getByText("owner_user")).toBeInTheDocument();
    expect(screen.getByText("A mock description for test portfolio.")).toBeInTheDocument();
  });

  test('shows AI Review trigger button when current user is the owner', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: 'owner_user', role: 'USER' }, // owner user matches portfolio.userId
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      token: null,
    });

    vi.mocked(useAiReview).mockReturnValue({
      activeReview: null,
      setActiveReview: vi.fn(),
      checkLatestReviewStatus: vi.fn(),
    });

    render(
      <BrowserRouter>
        <PortfolioCard portfolio={mockPortfolio} />
      </BrowserRouter>
    );

    const reviewButton = screen.getByRole('button', { name: /AI Review/i });
    expect(reviewButton).toBeInTheDocument();
    expect(reviewButton).not.toBeDisabled();
  });

  test('disables the button and shows loading state when AI review is IN_PROGRESS', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: 'owner_user', role: 'USER' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      token: null,
    });

    // Mock active review is IN_PROGRESS for this portfolio
    vi.mocked(useAiReview).mockReturnValue({
      activeReview: {
        id: 99,
        portfolioId: 42,
        portfolioUrl: 'https://testportfolio.com',
        version: 1,
        status: 'IN_PROGRESS',
        createdAt: '2026-06-03T12:00:00Z',
      },
      setActiveReview: vi.fn(),
      checkLatestReviewStatus: vi.fn(),
    });

    render(
      <BrowserRouter>
        <PortfolioCard portfolio={mockPortfolio} />
      </BrowserRouter>
    );

    const disabledButton = screen.getByRole('button', { name: /Auditing.../i });
    expect(disabledButton).toBeInTheDocument();
    expect(disabledButton).toBeDisabled();
  });

  test('calls triggerReview and redirects on click', async () => {
    const mockSetActiveReview = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: 'owner_user', role: 'USER' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      token: null,
    });

    vi.mocked(useAiReview).mockReturnValue({
      activeReview: null,
      setActiveReview: mockSetActiveReview,
      checkLatestReviewStatus: vi.fn(),
    });

    const mockStatusResponse = {
      id: 99,
      portfolioId: 42,
      portfolioUrl: 'https://testportfolio.com',
      version: 1,
      status: 'IN_PROGRESS' as const,
      createdAt: '2026-06-03T12:00:00Z',
    };

    vi.mocked(aiReviewService.triggerReview).mockResolvedValue(mockStatusResponse);

    render(
      <BrowserRouter>
        <PortfolioCard portfolio={mockPortfolio} />
      </BrowserRouter>
    );

    const reviewButton = screen.getByRole('button', { name: /AI Review/i });
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(aiReviewService.triggerReview).toHaveBeenCalledWith(42);
      expect(mockSetActiveReview).toHaveBeenCalledWith(mockStatusResponse);
      expect(mockNavigate).toHaveBeenCalledWith('/portfolios/ai-reviews/99');
    });
  });
});
