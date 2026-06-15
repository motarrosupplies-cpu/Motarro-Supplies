'use client';

import { QRCodeAnalytics as QRCodeAnalyticsType } from '@/types/qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface QRCodeAnalyticsProps {
  analytics: QRCodeAnalyticsType;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function QRCodeAnalytics({ analytics }: QRCodeAnalyticsProps) {
  // Prepare data for charts
  const scansByDateData = analytics.scans_by_date
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      scans: item.count,
    }));

  const scansByDeviceData = analytics.scans_by_device.map(item => ({
    name: item.device_type.charAt(0).toUpperCase() + item.device_type.slice(1),
    value: item.count,
  }));

  const scansByLocationData = analytics.scans_by_location
    .slice(0, 10) // Top 10 locations
    .map(item => ({
      name: item.city && item.country 
        ? `${item.city}, ${item.country}`
        : item.country || item.city || 'Unknown',
      value: item.count,
    }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_scans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.scans_by_location.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.scans_by_device.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Scans Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Scans Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scansByDateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scans" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Scans by Device */}
        <Card>
          <CardHeader>
            <CardTitle>Scans by Device Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scansByDeviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scansByDeviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scans by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scansByLocationData.length > 0 ? (
                scansByLocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No location data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recent_scans.length > 0 ? (
              analytics.recent_scans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {format(new Date(scan.scanned_at), 'PPp')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scan.device_type} • {scan.country || 'Unknown'} • {scan.city || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No scans yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

