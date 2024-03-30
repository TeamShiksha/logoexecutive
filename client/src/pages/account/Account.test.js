import React from 'react';
import { render, screen } from '@testing-library/react';
import Account from './Account';
import {BrowserRouter} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';

describe('Account Component', () => {
    const renderAccount = () => {
        render(
            <AuthContext.Provider
                value={false}
            >
                <BrowserRouter>
                    <Account />
                </BrowserRouter>
            </AuthContext.Provider>,
        );
    };

  it('renders without crashing', () => {
    renderAccount();
    const accountContainer = screen.getByTestId('testid-account');
    expect(accountContainer).toBeInTheDocument();
  });

  it('renders Profile, Divider, and Settings components', () => {
    renderAccount();
    const profileComponent = screen.getByTestId('testid-profile');
    const dividerComponent = screen.getByTestId('divider');
    const settingsComponent = screen.getByTestId('testid-settings');
    expect(profileComponent).toBeInTheDocument();
    expect(dividerComponent).toBeInTheDocument();
    expect(settingsComponent).toBeInTheDocument();
  });

  it('renders child components in the correct order', () => {
    renderAccount();
    const profileComponent = screen.getByTestId('testid-profile');
    const dividerComponent = screen.getByTestId('divider');
    const settingsComponent = screen.getByTestId('testid-settings');
    // eslint-disable-next-line testing-library/no-node-access
    const containerChildren = screen.getByTestId('testid-account').children;
    expect(containerChildren[0]).toEqual(profileComponent);
    expect(containerChildren[1]).toEqual(dividerComponent);
    expect(containerChildren[2]).toEqual(settingsComponent);
  });

  it('renders with correct CSS classes', () => {
    renderAccount();
    const accountContainer = screen.getByTestId('testid-account');
    expect(accountContainer).toHaveClass('account-container');
  });
});
