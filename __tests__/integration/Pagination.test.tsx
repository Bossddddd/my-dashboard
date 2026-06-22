import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../../components/Pagination';

// Mock LanguageContext
vi.mock('../../app/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        prevPage: 'Previous',
        nextPage: 'Next'
      };
      return dict[key] || key;
    }
  })
}));

describe('Pagination Component', () => {
  it('does not render if totalPages <= 1', () => {
    const { container } = render(
      <Pagination 
        currentPage={1} 
        totalPages={1} 
        onPageChange={vi.fn()} 
        totalItems={5} 
        startIndex={0} 
        itemsPerPage={10} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly for multiple pages', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalPages={5} 
        onPageChange={vi.fn()} 
        totalItems={50} 
        startIndex={0} 
        itemsPerPage={10} 
      />
    );
    
    // Check if Prev and Next buttons are rendered
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    
    // Check if page numbers are rendered
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('calls onPageChange when clicking a page number', () => {
    const onPageChangeMock = vi.fn();
    render(
      <Pagination 
        currentPage={1} 
        totalPages={3} 
        onPageChange={onPageChangeMock} 
        totalItems={30} 
        startIndex={0} 
        itemsPerPage={10} 
      />
    );
    
    // Click page 2
    fireEvent.click(screen.getByText('2'));
    expect(onPageChangeMock).toHaveBeenCalledWith(2);
    
    // Click Next
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChangeMock).toHaveBeenCalledWith(2); // Since current is 1, next is 2
  });
});
