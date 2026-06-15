"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, ExternalLink, QrCode, Share2 } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SchoolEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count?: {
    orders: number;
    eventProducts: number;
  };
}

export default function EventPublicPage() {
  const params = useParams();
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEvent(params.id as string);
    }
  }, [params.id]);

  const fetchEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/school-events/${eventId}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = `${window.location.origin}/school-events/${params.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Button asChild>
          <Link href="/admin/school-events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/school-events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Public Page</h1>
          <p className="text-muted-foreground">
            {event.name} - Share this link with parents to place orders
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Public Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Public Ordering Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Public URL:</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link href={publicUrl} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Page
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={event.isActive ? "default" : "secondary"}>
                {event.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Products:</span>
              <span className="text-sm">{event._count?.eventProducts || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Orders:</span>
              <span className="text-sm">{event._count?.orders || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Start Date:</span>
              <span className="text-sm">{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">End Date:</span>
              <span className="text-sm">{new Date(event.endDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sharing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            How to Share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-2">Copy the Link</h4>
                <p className="text-sm text-muted-foreground">
                  Use the copy button above to copy the public URL to your clipboard
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-2">Share with Parents</h4>
                <p className="text-sm text-muted-foreground">
                  Send the link via email, WhatsApp, or include it in school newsletters
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-2">Monitor Orders</h4>
                <p className="text-sm text-muted-foreground">
                  Check the Orders tab to see incoming orders from parents
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure the event is marked as "Active" before sharing</li>
                <li>• Ensure you have products and variants configured</li>
                <li>• Consider setting up a deadline for orders</li>
                <li>• Use the QR code feature for easy mobile access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
