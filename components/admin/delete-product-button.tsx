'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  onProductDeleted: () => void;
}

export function DeleteProductButton({ productId, productName, onProductDeleted }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    try {
      console.log('=== DELETE PRODUCT DEBUG ===');
      console.log('Deleting product ID:', productId);
      console.log('Product name:', productName);
      
      setIsDeleting(true);
      
      // Call the callback immediately to optimistically update the UI
      console.log('Calling onProductDeleted callback...');
      onProductDeleted?.();
      
      const response = await fetch(`/api/products/optimized/${productId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete error response:', error);
        // Call callback again to refresh and restore correct state
        onProductDeleted?.();
        throw new Error(error.error || 'Failed to delete product');
      }

      console.log('Product deleted successfully');
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });

      // Call callback one more time to ensure latest state
      onProductDeleted?.();
    } catch (error) {
      console.error('Delete product error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{productName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 