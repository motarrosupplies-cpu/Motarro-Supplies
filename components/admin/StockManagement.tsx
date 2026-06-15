'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StockAlert {
  id: string;
  name: string;
  currentStock: number;
  threshold: number;
  category: string;
}

interface StockUpdate {
  id: string;
  productName: string;
  quantitySold: number;
  previousStock: number;
  newStock: number;
  date: string;
}

export function StockManagement() {
  const [lowStockProducts, setLowStockProducts] = useState<StockAlert[]>([]);
  const [recentStockUpdates, setRecentStockUpdates] = useState<StockUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      // Fetch products with low stock (less than 10 items) from unified view
      const { data: products, error: productsError } = await supabase
        .from('all_products_unified')
        .select('id, name, total_stock, category')
        .lt('total_stock', 10)
        .order('total_stock', { ascending: true });

      if (productsError) throw productsError;

      const stockAlerts: StockAlert[] = (products || []).map(product => ({
        id: product.id,
        name: product.name,
        currentStock: Number(product.total_stock) || 0,
        threshold: 10,
        category: product.category,
      }));

      setLowStockProducts(stockAlerts);

      // Fetch recent stock updates from stock_updates table
      const { data: updates, error: updatesError } = await supabase
        .from('stock_updates')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (updatesError) throw updatesError;

      const recentUpdates: StockUpdate[] = (updates || []).map(update => ({
        id: update.id,
        productName: update.product_name,
        quantitySold: update.quantity_sold,
        previousStock: update.previous_stock,
        newStock: update.new_stock,
        date: update.date,
      }));

      setRecentStockUpdates(recentUpdates);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 5) return 'destructive';
    if (stock < 10) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading stock data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No low stock alerts
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStockStatusColor(product.currentStock)}>
                      {product.currentStock} in stock
                    </Badge>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{lowStockProducts.length - 5} more products with low stock
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Stock Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-500" />
            Recent Stock Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentStockUpdates.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent stock updates
            </div>
          ) : (
            <div className="space-y-3">
              {recentStockUpdates.map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{update.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Sold {update.quantitySold} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {update.previousStock} → {update.newStock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(update.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 