import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  test('returns null if totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={0} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders correct number of page buttons and highlights active page', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />
    );

    // Assert buttons for pages 1, 2, 3 are rendered
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();

    // Check active class on the page items
    const pageItem2 = screen.getByRole('button', { name: '2' }).closest('li');
    expect(pageItem2).toHaveClass('active');
  });

  test('calls onPageChange with correct values when buttons are clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={handlePageChange} />
    );

    // Click next page button
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    // Click previous page button
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    fireEvent.click(prevButton);
    expect(handlePageChange).toHaveBeenCalledWith(0);

    // Click a specific page button
    const page3Button = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Button);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  test('disables previous button on first page and next button on last page', () => {
    const { rerender } = render(
      <Pagination currentPage={0} totalPages={3} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();

    // Rerender on the last page (index 2)
    rerender(
      <Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
