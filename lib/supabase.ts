import { supabase } from '@/lib/supabaseClient';

// ============================================================================
// Job Type Definitions
// ============================================================================

export type JobStatus = 'new' | 'artwork' | 'proof' | 'printing' | 'packing' | 'done';

export interface Job {
  id: string;
  order_number: string;
  customer_name: string;
  items: string | null;
  due_date: string | null;
  status: JobStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  order_number: string;
  customer_name: string;
  items?: string;
  due_date?: string;
  status?: JobStatus;
  notes?: string;
}

export interface UpdateJobData {
  order_number?: string;
  customer_name?: string;
  items?: string;
  due_date?: string;
  status?: JobStatus;
  notes?: string;
}

// ============================================================================
// Job Database Functions
// ============================================================================

/**
 * Get all jobs from the database
 * @param options Optional filtering and sorting options
 * @returns Array of Job objects
 */
export async function getJobs(options?: {
  status?: JobStatus;
  orderBy?: 'created_at' | 'due_date' | 'order_number';
  ascending?: boolean;
}): Promise<Job[]> {
  try {
    let query = supabase
      .from('jobs')
      .select('*');

    // Apply status filter if provided
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    // Apply ordering
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending !== undefined ? options.ascending : false;
    query = query.order(orderBy, { ascending });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobs:', error);
    throw error;
  }
}

/**
 * Get a single job by ID
 * @param id Job UUID
 * @returns Job object or null if not found
 */
export async function getJobById(id: string): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching job:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getJobById:', error);
    throw error;
  }
}

/**
 * Get jobs by order number
 * @param orderNumber Order number to search for
 * @returns Array of Job objects matching the order number
 */
export async function getJobsByOrderNumber(orderNumber: string): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('order_number', orderNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs by order number:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobsByOrderNumber:', error);
    throw error;
  }
}

/**
 * Create a new job
 * @param jobData Job data to insert
 * @returns Created Job object
 */
export async function addJob(jobData: CreateJobData): Promise<Job> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          order_number: jobData.order_number,
          customer_name: jobData.customer_name,
          items: jobData.items || null,
          due_date: jobData.due_date || null,
          status: jobData.status || 'new',
          notes: jobData.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addJob:', error);
    throw error;
  }
}

/**
 * Update a job's status
 * @param id Job UUID
 * @param status New status value
 * @returns Updated Job object
 */
export async function updateJobStatus(id: string, status: JobStatus): Promise<Job> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateJobStatus:', error);
    throw error;
  }
}

/**
 * Update a job with partial data
 * @param id Job UUID
 * @param jobData Partial job data to update
 * @returns Updated Job object
 */
export async function updateJob(id: string, jobData: UpdateJobData): Promise<Job> {
  try {
    const updateData: Partial<Job> = {};

    if (jobData.order_number !== undefined) updateData.order_number = jobData.order_number;
    if (jobData.customer_name !== undefined) updateData.customer_name = jobData.customer_name;
    if (jobData.items !== undefined) updateData.items = jobData.items;
    if (jobData.due_date !== undefined) updateData.due_date = jobData.due_date;
    if (jobData.status !== undefined) updateData.status = jobData.status;
    if (jobData.notes !== undefined) updateData.notes = jobData.notes;

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateJob:', error);
    throw error;
  }
}

/**
 * Delete a job
 * @param id Job UUID
 * @returns true if successful, false otherwise
 */
export async function deleteJob(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteJob:', error);
    throw error;
  }
}

/**
 * Get jobs that are due soon (within specified days)
 * @param days Number of days to look ahead (default: 7)
 * @returns Array of Job objects due within the specified days
 */
export async function getJobsDueSoon(days: number = 7): Promise<Job[]> {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .not('due_date', 'is', null)
      .lte('due_date', futureDate.toISOString())
      .gte('due_date', now.toISOString())
      .neq('status', 'done')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching jobs due soon:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobsDueSoon:', error);
    throw error;
  }
}

/**
 * Get jobs by status
 * @param status Job status to filter by
 * @returns Array of Job objects with the specified status
 */
export async function getJobsByStatus(status: JobStatus): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs by status:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobsByStatus:', error);
    throw error;
  }
}

