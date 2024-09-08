import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { useContext, useEffect } from 'react';
import { server } from '../mocks/server';
import { OperatorContext, OperatorProvider } from './OperatorContext';

const TestComponent = () => {
  const { queries, loading, error, fetchQueries } = useContext(OperatorContext);
  useEffect(() => {
    fetchQueries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Failed to fetch user data</div>;
  return <div>{queries?.[0]?.message}</div>;
};

describe('UserProvider', () => {
  test('should fetch user data', async () => {
    render(
      <OperatorProvider>
        <TestComponent />
      </OperatorProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Give me some logos.....')).toBeInTheDocument();
    });
  });

  test('should handle error', async () => {
    server.use(
      rest.get('/api/common/pagination', (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    render(
      <OperatorProvider>
        <TestComponent />
      </OperatorProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user data')).toBeInTheDocument();
    });
  });
});
