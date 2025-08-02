import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import { Issue, IssueFilters } from '../types';

export default function useIssues(
  location: { lat: number; lng: number } | null,
  filters: IssueFilters
) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      radius: filters.radius.toString(),
      ...(filters.category && { category: filters.category }),
      ...(filters.status && { status: filters.status })
    });
    const res = await API.get(`/issues/nearby?${params}`);
    setIssues(res.data.issues);
    setLoading(false);
  }, [location, filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return { issues, loading, fetchIssues };
}
