import { render, fireEvent, screen } from '@testing-library/react';
import ApiKeyTable from './ApiKeyTable';

describe('ApiKeyTable', () => {
  const keys = [
    {
      keyDescription: 'Test Key 1',
      key: '123',
      keyId: 'id1',
      createdAt: '2024-02-29',
    },
    {
      keyDescription: 'Test Key 2',
      key: '456',
      keyId: 'id2',
      createdAt: '2024-02-28',
    },
  ];

  it('Renders correctly', () => {
    render(
      <ApiKeyTable
        keys={keys}
        handleCloseKey={() => { }}
        deleteKey={() => { }}
      />,
    );
    expect(screen.getByText('Test Key 1')).toBeInTheDocument();
    expect(screen.getByText('Test Key 2')).toBeInTheDocument();
    expect(screen.getByText('February 29, 2024')).toBeInTheDocument();
    expect(screen.getByText('February 28, 2024')).toBeInTheDocument();
  });

  it('show confirmation modal when delete button is clicked', () => {
    render(
      <ApiKeyTable
        keys={keys}
        handleCloseKey={() => { }}
        deleteKey={() => { }}
      />,
    );
    const buttons = screen.getAllByTestId('api-key-delete');
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/Are you sure?/i)).toBeInTheDocument();
  });

  it('close the confirmation modal when cancel button is clicked in modal', () => {
    render(
      <ApiKeyTable
        keys={keys}
        handleCloseKey={() => { }}
        deleteKey={() => { }}
      />,
    );

    const buttons = screen.getAllByTestId('api-key-delete');
    fireEvent.click(buttons[0]);
    const modalTitle = screen.getByText(/Are you sure?/i);
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(modalTitle).not.toBeInTheDocument();
  });

  it('remove key when delete is confirmed', () => {
    const deleteKey = jest.fn();
    render(
      <ApiKeyTable
        keys={keys}
        handleCloseKey={() => { }}
        deleteKey={deleteKey}
      />,
    );

    const buttons = screen.getAllByTestId('api-key-delete');
    fireEvent.click(buttons[0]);
    const confirmButton = screen.getByText(/Okay/i);

    fireEvent.click(confirmButton);
    expect(deleteKey).toHaveBeenCalledWith('id1');
    expect(deleteKey).toHaveBeenCalledTimes(1);
  });

  it('does not remove key when delete is cancelled', () => {
    const deleteKey = jest.fn();
    render(
      <ApiKeyTable
        keys={keys}
        handleCloseKey={() => { }}
        deleteKey={deleteKey}
      />,
    );

    const buttons = screen.getAllByTestId('api-key-delete');
    fireEvent.click(buttons[0]);
    const cancelButton = screen.getByText(/Cancel/i);

    fireEvent.click(cancelButton);
    expect(deleteKey).not.toHaveBeenCalled();
  });
});

