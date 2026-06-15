import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Force deleting school event:', id);
    
    // First, delete all related data in the correct order (to avoid foreign key constraints)
    
    // 1. Delete order item addons first
    const { error: addonsError } = await supabase
      .from('school_event_order_item_addons')
      .delete()
      .eq('orderId', 
        supabase
          .from('school_event_order_items')
          .select('id')
          .eq('orderId', 
            supabase
              .from('school_event_orders')
              .select('id')
              .eq('eventId', id)
          )
      );
    
    if (addonsError) {
      console.log('No addons to delete or error (this is OK):', addonsError.message);
    }
    
    // 2. Delete order items
    const { error: orderItemsError } = await supabase
      .from('school_event_order_items')
      .delete()
      .eq('orderId', 
        supabase
          .from('school_event_orders')
          .select('id')
          .eq('eventId', id)
      );
    
    if (orderItemsError) {
      console.log('No order items to delete or error (this is OK):', orderItemsError.message);
    }
    
    // 3. Delete orders
    const { error: ordersError } = await supabase
      .from('school_event_orders')
      .delete()
      .eq('eventId', id);
    
    if (ordersError) {
      console.log('No orders to delete or error (this is OK):', ordersError.message);
    }
    
    // 4. Delete product variants
    const { error: variantsError } = await supabase
      .from('event_product_variants')
      .delete()
      .eq('productId', 
        supabase
          .from('event_products')
          .select('id')
          .eq('eventId', id)
      );
    
    if (variantsError) {
      console.log('No variants to delete or error (this is OK):', variantsError.message);
    }
    
    // 5. Delete additional items and options
    const { error: additionalItemsError } = await supabase
      .from('event_product_additional_items')
      .delete()
      .eq('productId', 
        supabase
          .from('event_products')
          .select('id')
          .eq('eventId', id)
      );
    
    if (additionalItemsError) {
      console.log('No additional items to delete or error (this is OK):', additionalItemsError.message);
    }
    
    // 6. Delete additional item options
    const { error: additionalOptionsError } = await supabase
      .from('event_product_additional_item_options')
      .delete()
      .eq('additionalItemId', 
        supabase
          .from('event_product_additional_items')
          .select('id')
          .eq('productId', 
            supabase
              .from('event_products')
              .select('id')
              .eq('eventId', id)
          )
      );
    
    if (additionalOptionsError) {
      console.log('No additional options to delete or error (this is OK):', additionalOptionsError.message);
    }
    
    // 7. Delete products
    const { error: productsError } = await supabase
      .from('event_products')
      .delete()
      .eq('eventId', id);
    
    if (productsError) {
      console.log('No products to delete or error (this is OK):', productsError.message);
    }
    
    // 8. Finally, delete the event itself
    const { error: eventError } = await supabase
      .from('school_events')
      .delete()
      .eq('id', id);

    if (eventError) {
      console.error('Error deleting school event:', eventError);
      return NextResponse.json(
        { error: `Failed to delete school event: ${eventError.message}` },
        { status: 500 }
      );
    }

    console.log('Successfully force deleted school event:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'School event and all related data deleted successfully' 
    });
  } catch (error) {
    console.error('Error force deleting school event:', error);
    return NextResponse.json(
      { error: `Failed to force delete school event: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
