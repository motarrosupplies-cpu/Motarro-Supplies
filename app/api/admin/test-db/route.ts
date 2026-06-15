import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseClient"
import { describeSupabaseAdminKeyError } from "@/lib/supabase-env"

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          status: "error",
          error:
            "SUPABASE_SERVICE_ROLE_KEY is not configured. Admin database checks require the service role key.",
        },
        { status: 500 }
      )
    }

    console.log("GET /api/admin/test-db - Starting comprehensive database test...")

    const { error: menuError } = await supabaseAdmin
      .from("menu_items")
      .select("count")
      .limit(1)

    if (menuError) {
      console.error("Error accessing menu_items table:", menuError)
      const friendlyError =
        menuError.message.toLowerCase().includes('invalid api key') ||
        menuError.message.toLowerCase().includes('invalid jwt')
          ? describeSupabaseAdminKeyError(menuError.message)
          : menuError.message
      return NextResponse.json(
        {
          status: "error",
          message: "menu_items table error",
          error: friendlyError,
          details: {
            table: "menu_items",
            error_type: "access_error",
          },
        },
        { status: 500 }
      )
    }

    const { error: categoryError } = await supabaseAdmin
      .from("product_categories")
      .select("count")
      .limit(1)

    if (categoryError) {
      console.error("Error accessing product_categories table:", categoryError)
      return NextResponse.json(
        {
          status: "error",
          message: "product_categories table error",
          error: categoryError.message,
          details: {
            table: "product_categories",
            error_type: "access_error",
          },
        },
        { status: 500 }
      )
    }

    const { data: sampleMenuItems, error: sampleError } = await supabaseAdmin
      .from("menu_items")
      .select("*")
      .limit(5)

    if (sampleError) {
      console.error("Error fetching sample menu items:", sampleError)
      return NextResponse.json(
        {
          status: "error",
          message: "Error fetching sample data",
          error: sampleError.message,
          details: {
            table: "menu_items",
            error_type: "fetch_error",
          },
        },
        { status: 500 }
      )
    }

    const { data: sampleCategories, error: categorySampleError } =
      await supabaseAdmin
        .from("product_categories")
        .select("*")
        .limit(5)

    if (categorySampleError) {
      console.error("Error fetching sample product categories:", categorySampleError)
      return NextResponse.json(
        {
          status: "error",
          message: "Error fetching sample product categories",
          error: categorySampleError.message,
          details: {
            table: "product_categories",
            error_type: "fetch_error",
          },
        },
        { status: 500 }
      )
    }

    const testItem = {
      label: "TEST_ITEM_DELETE_ME",
      href: null,
      parent_id: null,
      order_index: 999,
      level: 0,
      is_header: false,
      is_active: false,
      description: "Test item for database validation",
    }

    const { data: insertedItem, error: insertError } = await supabaseAdmin
      .from("menu_items")
      .insert([testItem])
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting test menu item:", insertError)
      return NextResponse.json(
        {
          status: "error",
          message: "Error inserting test menu item",
          error: insertError.message,
          details: {
            table: "menu_items",
            error_type: "insert_error",
            test_data: testItem,
          },
        },
        { status: 500 }
      )
    }

    const { error: deleteError } = await supabaseAdmin
      .from("menu_items")
      .delete()
      .eq("id", insertedItem.id)

    if (deleteError) {
      console.error("Warning: Could not delete test item:", deleteError)
    }

    return NextResponse.json({
      status: "success",
      message: "Database connection and tables are working perfectly",
      tables: {
        menu_items: "accessible",
        product_categories: "accessible",
      },
      sample_data_count:
        (sampleMenuItems?.length || 0) + (sampleCategories?.length || 0),
      insert_test: "passed",
      details: "All database operations working correctly",
    })
  } catch (error) {
    console.error("Unexpected error in test-db:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error",
        error: error instanceof Error ? error.message : String(error),
        details: {
          error_type: "unexpected_error",
        },
      },
      { status: 500 }
    )
  }
}
