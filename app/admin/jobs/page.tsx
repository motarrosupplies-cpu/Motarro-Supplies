'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getJobs } from '@/lib/supabase';
import type { Job } from '@/lib/supabase';
import KanbanBoard from '@/components/admin/KanbanBoard';
import AddJobForm from '@/components/admin/AddJobForm';

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.replace('/admin/login');
          return;
        }

        setUser(user);
      } catch (err) {
        console.error('Error checking auth:', err);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/admin/login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      try {
        setError(null);
        const jobsData = await getJobs({
          orderBy: 'created_at',
          ascending: false,
        });
        setJobs(jobsData);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'Failed to load jobs');
      }
    };

    if (user) {
      fetchJobs();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Manage and track job orders through the production pipeline
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <p className="font-medium">Error loading jobs</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <AddJobForm onJobAdded={() => {
        // Refetch jobs after adding
        getJobs({ orderBy: 'created_at', ascending: false })
          .then(setJobs)
          .catch((err) => setError(err.message));
      }} />

      <KanbanBoard jobs={jobs} onJobUpdate={() => {
        // Refetch jobs after update
        getJobs({ orderBy: 'created_at', ascending: false })
          .then(setJobs)
          .catch((err) => setError(err.message));
      }} />
    </div>
  );
}

