export async function fetchAllUnifiedMerchantRows(
  client: { from: (table: string) => any }
): Promise<Record<string, unknown>[]> {
  const pageSize = 1000;
  let from = 0;
  const rows: Record<string, unknown>[] = [];

  while (true) {
    const { data, error } = await client
      .from("all_products_unified")
      .select("*")
      .eq("status", "active")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    const batch = (data as Record<string, unknown>[]) ?? [];
    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}
