'use client';

import { QRCode } from '@/types/qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  Edit, 
  Trash2, 
  Archive, 
  Eye,
  Download,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// Client-side URL helper
function getQRCodeUrl(shortUrl: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/qr/${shortUrl}`;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.motarro.co.za';
  return `${baseUrl}/qr/${shortUrl}`;
}

interface QRCodeListProps {
  qrCodes: QRCode[];
  onEdit?: (qrCode: QRCode) => void;
  onDelete?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

export function QRCodeList({ qrCodes, onEdit, onDelete, onDeactivate }: QRCodeListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'deactivated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url':
        return 'bg-blue-100 text-blue-800';
      case 'discount':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (qrCodes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No QR codes found. Create your first QR code to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{qrCode.title}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(qrCode.status)}>
                    {qrCode.status}
                  </Badge>
                  <Badge className={getTypeColor(qrCode.type)}>
                    {qrCode.type}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/qr-codes/${qrCode.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/qr-codes/${qrCode.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/qr-codes/${qrCode.id}/analytics`}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      const url = `/api/qr-codes/${qrCode.id}/generate?format=png&size=1000`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {qrCode.status === 'active' && onDeactivate && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        onDeactivate(qrCode.id);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
                          onDelete(qrCode.id);
                        }
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <img
                  src={`/api/qr-codes/${qrCode.id}/generate?format=png&size=150`}
                  alt={qrCode.title}
                  className="w-32 h-32"
                />
              </div>

              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Short URL:</span>{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {getQRCodeUrl(qrCode.short_url)}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Scans:</span> {qrCode.scan_count}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(qrCode.updated_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

