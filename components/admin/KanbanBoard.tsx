'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { updateJobStatusAction } from '@/app/admin/jobs/actions';
import type { Job, JobStatus } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Package, User } from 'lucide-react';

interface KanbanBoardProps {
  jobs: Job[];
  onJobUpdate: () => void;
}

interface Column {
  id: JobStatus;
  title: string;
  jobs: Job[];
}

const COLUMN_CONFIG: { id: JobStatus; title: string }[] = [
  { id: 'new', title: 'New Orders' },
  { id: 'artwork', title: 'Artwork' },
  { id: 'proof', title: 'Proof Sent' },
  { id: 'printing', title: 'Printing' },
  { id: 'packing', title: 'Packing' },
  { id: 'done', title: 'Completed' },
];

export default function KanbanBoard({ jobs, onJobUpdate }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Organize jobs into columns
  useEffect(() => {
    const organizedColumns: Column[] = COLUMN_CONFIG.map((config) => ({
      ...config,
      jobs: jobs.filter((job) => job.status === config.id),
    }));
    setColumns(organizedColumns);
  }, [jobs]);

  const calculateDaysUntilDue = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the new status from the destination column
    const newStatus = destination.droppableId as JobStatus;

    try {
      const result = await updateJobStatusAction(draggableId, newStatus);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Job status updated',
        });
        onJobUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update job status',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job status',
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col bg-gray-100 rounded-lg min-h-[600px]"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-gray-200 rounded-t-lg px-4 py-3 border-b">
                <h3 className="font-semibold text-sm text-gray-900">
                  {column.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {column.jobs.length} {column.jobs.length === 1 ? 'job' : 'jobs'}
                </p>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {column.jobs.map((job, index) => {
                      const daysUntilDue = calculateDaysUntilDue(job.due_date);
                      const isUrgent = daysUntilDue !== null && daysUntilDue < 5 && daysUntilDue >= 0;

                      return (
                        <Draggable
                          key={job.id}
                          draggableId={job.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''
                              } ${
                                isUrgent ? 'border-red-500 border-2' : ''
                              }`}
                              data-id={job.id}
                            >
                              <div className="p-3 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-gray-900">
                                      {job.order_number}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                      <User className="h-3 w-3" />
                                      <span>{job.customer_name}</span>
                                    </div>
                                  </div>
                                </div>

                                {job.items && (
                                  <div className="flex items-start gap-1 text-xs text-gray-700">
                                    <Package className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{job.items}</span>
                                  </div>
                                )}

                                {job.due_date && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Calendar className={`h-3 w-3 ${isUrgent ? 'text-red-500' : 'text-gray-500'}`} />
                                    <span className={isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                      {daysUntilDue !== null
                                        ? daysUntilDue < 0
                                          ? `${Math.abs(daysUntilDue)} days overdue`
                                          : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left`
                                        : 'Due date set'}
                                    </span>
                                  </div>
                                )}

                                {job.notes && (
                                  <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                                    {job.notes}
                                  </div>
                                )}
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

