import { useState, useEffect } from 'react';
import { safeAtob } from '@ks-console/shared';

export const useFetchToken = (url: string, authToken: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const fetchToken = async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch token');
        }

        const data = await response.json();
        const fetchedToken = data.data.token;

        if (fetchedToken) {
          const decodedToken = safeAtob(fetchedToken);
          setToken(decodedToken);
        } else {
          throw new Error('Token not found in response');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchToken();
  }, [url, authToken]);

  return { token, fetchLoading, error };
};
