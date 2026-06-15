'use server';

import { addJob, updateJobStatus, getJobs } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { CreateJobData, JobStatus } from '@/lib/supabase';

/**
 * Server Action to create a new job
 */
export async function createJobAction(formData: FormData) {
  try {
    const order_number = formData.get('order_number') as string;
    const customer_name = formData.get('customer_name') as string;
    const items = formData.get('items') as string | null;
    const due_date = formData.get('due_date') as string | null;
    const notes = formData.get('notes') as string | null;

    // Validate required fields
    if (!order_number || !customer_name) {
      return {
        success: false,
        error: 'Order number and customer name are required',
      };
    }

    const jobData: CreateJobData = {
      order_number: order_number.trim(),
      customer_name: customer_name.trim(),
      items: items?.trim() || undefined,
      due_date: due_date || undefined,
      notes: notes?.trim() || undefined,
      status: 'new',
    };

    const job = await addJob(jobData);

    // Revalidate the jobs page to show the new job
    revalidatePath('/admin/jobs');

    return {
      success: true,
      data: job,
    };
  } catch (error: any) {
    console.error('Error creating job:', error);
    return {
      success: false,
      error: error.message || 'Failed to create job',
    };
  }
}

/**
 * Server Action to update a job's status
 */
export async function updateJobStatusAction(jobId: string, newStatus: JobStatus) {
  try {
    if (!jobId || !newStatus) {
      return {
        success: false,
        error: 'Job ID and status are required',
      };
    }

    // Validate status value
    const validStatuses: JobStatus[] = ['new', 'artwork', 'proof', 'printing', 'packing', 'done'];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        error: 'Invalid status value',
      };
    }

    const updatedJob = await updateJobStatus(jobId, newStatus);

    // Revalidate the jobs page to reflect the update
    revalidatePath('/admin/jobs');

    return {
      success: true,
      data: updatedJob,
    };
  } catch (error: any) {
    console.error('Error updating job status:', error);
    return {
      success: false,
      error: error.message || 'Failed to update job status',
    };
  }
}

/**
 * Server Action to fetch all jobs
 */
export async function fetchJobsAction() {
  try {
    const jobs = await getJobs({
      orderBy: 'created_at',
      ascending: false,
    });

    return {
      success: true,
      data: jobs,
    };
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch jobs',
      data: [],
    };
  }
}

