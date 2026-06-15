'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, Clock, Star, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Directory {
  name: string;
  url: string;
  type: 'local' | 'industry' | 'social';
  status: 'submitted' | 'pending' | 'not-submitted';
  priority: 'high' | 'medium' | 'low';
  lastUpdated?: string;
  notes?: string;
}

export function LocalBusinessDirectory() {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching directory data
    const mockDirectories: Directory[] = [
      // High Priority Local Directories
      {
        name: 'Google My Business',
        url: 'https://business.google.com',
        type: 'local',
        status: 'submitted',
        priority: 'high',
        lastUpdated: '2024-01-15',
        notes: 'Profile verified, 85% complete'
      },
      {
        name: 'Yellow Pages South Africa',
        url: 'https://www.yellowpages.co.za',
        type: 'local',
        status: 'not-submitted',
        priority: 'high',
        notes: 'Free business listing available'
      },
      {
        name: 'Hello Peter',
        url: 'https://www.hellopeter.com',
        type: 'local',
        status: 'not-submitted',
        priority: 'high',
        notes: 'South African business directory'
      },
      {
        name: 'Gumtree Business Directory',
        url: 'https://www.gumtree.co.za',
        type: 'local',
        status: 'not-submitted',
        priority: 'high',
        notes: 'Local business listings'
      },
      {
        name: 'SA Yellow',
        url: 'https://www.sayellow.com',
        type: 'local',
        status: 'not-submitted',
        priority: 'high',
        notes: 'Comprehensive business directory'
      },
      
      // Industry-Specific Directories
      {
        name: 'Fashion United',
        url: 'https://fashionunited.com',
        type: 'industry',
        status: 'not-submitted',
        priority: 'medium',
        notes: 'Global fashion industry directory'
      },
      {
        name: 'Apparel Search',
        url: 'https://www.apparelsearch.com',
        type: 'industry',
        status: 'not-submitted',
        priority: 'medium',
        notes: 'International apparel directory'
      },
      {
        name: 'Textile World',
        url: 'https://www.textileworld.com',
        type: 'industry',
        status: 'not-submitted',
        priority: 'medium',
        notes: 'Textile and apparel industry'
      },
      {
        name: 'PrintWeek',
        url: 'https://www.printweek.com',
        type: 'industry',
        status: 'not-submitted',
        priority: 'medium',
        notes: 'Printing industry directory'
      },
      {
        name: 'South African Printers Association',
        url: 'https://www.sapa.org.za',
        type: 'industry',
        status: 'not-submitted',
        priority: 'medium',
        notes: 'Industry organization membership'
      }
    ];

    setDirectories(mockDirectories);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'not-submitted':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Submitted</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'local':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'industry':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'social':
        return <Globe className="h-4 w-4 text-green-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Local Business Directory Submissions</CardTitle>
          <CardDescription>Loading directory information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const submittedCount = directories.filter(d => d.status === 'submitted').length;
  const pendingCount = directories.filter(d => d.status === 'pending').length;
  const notSubmittedCount = directories.filter(d => d.status === 'not-submitted').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{submittedCount}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{notSubmittedCount}</p>
                <p className="text-sm text-muted-foreground">Not Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Directory List */}
      <Card>
        <CardHeader>
          <CardTitle>Directory Submissions</CardTitle>
          <CardDescription>Track your local business directory submissions and backlink opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {directories.map((directory, index) => (
              <div key={index}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(directory.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{directory.name}</h3>
                        <span className={`text-xs font-medium ${getPriorityColor(directory.priority)}`}>
                          {directory.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{directory.notes}</p>
                      {directory.lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {directory.lastUpdated}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(directory.status)}
                    <Button variant="outline" size="sm" asChild>
                      <a href={directory.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  </div>
                </div>
                {index < directories.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Tips</CardTitle>
          <CardDescription>Best practices for directory submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Consistent Business Information</p>
              <p className="text-xs text-muted-foreground">
                Use the same business name, address, and contact details across all directories
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Complete Profile Information</p>
              <p className="text-xs text-muted-foreground">
                Fill out all available fields including description, categories, and photos
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Regular Updates</p>
              <p className="text-xs text-muted-foreground">
                Keep business hours, services, and contact information current
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Monitor and Respond</p>
              <p className="text-xs text-muted-foreground">
                Check directories regularly for reviews and customer inquiries
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
