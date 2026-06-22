import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Next.js next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));
