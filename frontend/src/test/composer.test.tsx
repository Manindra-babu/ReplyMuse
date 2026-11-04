import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StarRating } from '../components/common/StarRating';
import { ToastProvider } from '../context/ToastContext';

describe('StarRating Component', () => {
  it('renders 5 stars and handles selection', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={4} onChange={handleChange} interactive />);

    const starButtons = screen.getAllByRole('button');
    expect(starButtons).toHaveLength(5);

    fireEvent.click(starButtons[4]); // Click 5th star
    expect(handleChange).toHaveBeenCalledWith(5);
  });
});
