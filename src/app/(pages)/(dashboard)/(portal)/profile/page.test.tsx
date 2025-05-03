import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePage from './page';

describe('ProfilePage', () => {
  it('renders the placeholder heading and message', () => {
    render(<ProfilePage />);
    // Assert the h3 heading with level 3 is rendered
    const heading = screen.getByRole('heading', { name: 'Profile', level: 3 });
    expect(heading).toBeInTheDocument();
    // Assert the placeholder message is shown
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });
}); 