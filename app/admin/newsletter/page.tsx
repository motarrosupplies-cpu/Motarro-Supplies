'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mail, Search, Copy, CheckCircle, XCircle, Calendar, Tag } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface NewsletterSubscriber {
  id: string;
  email: string;
  discount_code: string;
  discount_percent: number;
  code_used: boolean;
  code_expires_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  is_active: boolean;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/newsletter-subscribers');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load subscribers');
      }

      setSubscribers(result.data || []);
    } catch (error: any) {
      console.error('Error loading subscribers:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load newsletter subscribers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: 'Copied!',
        description: 'Discount code copied to clipboard.',
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy code.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isCodeExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(search.toLowerCase()) ||
    subscriber.discount_code.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.is_active).length,
    codesUsed: subscribers.filter((s) => s.code_used).length,
    codesExpired: subscribers.filter((s) => isCodeExpired(s.code_expires_at)).length,
  };

  return (
    <div className="space-y-6">
      <AdminHeader searchQuery={search} onSearchChange={setSearch} />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            Manage newsletter subscribers and discount codes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Codes Used</CardTitle>
            <Tag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.codesUsed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Codes</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.codesExpired}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8">No subscribers found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Discount Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Code Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => {
                    const expired = isCodeExpired(subscriber.code_expires_at);
                    return (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {subscriber.discount_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(subscriber.discount_code)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedCode === subscriber.discount_code ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscriber.is_active ? (
                            <Badge variant="default" className="bg-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unsubscribed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscriber.code_used ? (
                            <Badge variant="secondary">Used</Badge>
                          ) : expired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="default" className="bg-blue-600">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscriber.source || 'popup'}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
                        <TableCell>
                          {subscriber.code_expires_at
                            ? formatDate(subscriber.code_expires_at)
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {subscriber.email_sent ? (
                              <Badge variant="outline" className="text-green-600">
                                Email Sent
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

