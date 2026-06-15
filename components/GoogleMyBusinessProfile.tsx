'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Mail, Globe, Star, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BusinessProfile {
  name: string;
  rating: number;
  reviewCount: number;
  profileStrength: string;
  customerInteractions: number;
  profileViews: number;
  verificationStatus: string;
  lastUpdated: string;
}

export function GoogleMyBusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/google-my-business');
        const data = await response.json();
        setProfile({
          name: data.business.name,
          rating: data.business.ratings.google,
          reviewCount: data.business.ratings.totalReviews,
          profileStrength: data.directories.googleMyBusiness.profileStrength,
          customerInteractions: data.directories.googleMyBusiness.customerInteractions,
          profileViews: data.directories.googleMyBusiness.profileViews,
          verificationStatus: data.directories.googleMyBusiness.verificationStatus,
          lastUpdated: data.directories.googleMyBusiness.lastUpdated
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google My Business Profile</CardTitle>
          <CardDescription>Loading profile information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google My Business Profile</CardTitle>
          <CardDescription>Unable to load profile information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const profileStrengthNumber = parseInt(profile.profileStrength.replace('%', ''));
  const strengthColor = profileStrengthNumber >= 80 ? 'text-green-600' : 
                       profileStrengthNumber >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                {profile.name}
              </CardTitle>
              <CardDescription>Google My Business Profile Overview</CardDescription>
            </div>
            <Badge variant={profile.verificationStatus === 'verified' ? 'default' : 'secondary'}>
              {profile.verificationStatus === 'verified' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {profile.verificationStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Strength</span>
              <span className={`text-sm font-bold ${strengthColor}`}>
                {profile.profileStrength}
              </span>
            </div>
            <Progress value={profileStrengthNumber} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete your profile to improve visibility in local search results
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-lg">{profile.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.reviewCount} reviews
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-bold text-lg">{profile.profileViews}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Profile views this month
              </p>
            </div>
          </div>

          {/* Customer Interactions */}
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Phone className="h-4 w-4 text-purple-500" />
              <span className="font-bold text-lg">{profile.customerInteractions}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Customer interactions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Optimization Tips</CardTitle>
          <CardDescription>Actions to improve your Google My Business profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Complete Business Information</p>
              <p className="text-xs text-muted-foreground">
                Add detailed business description, categories, and attributes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Upload High-Quality Photos</p>
              <p className="text-xs text-muted-foreground">
                Add business photos, logo, and product/service images
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Regular Posts & Updates</p>
              <p className="text-xs text-muted-foreground">
                Share business updates, offers, and events regularly
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Respond to Reviews</p>
              <p className="text-xs text-muted-foreground">
                Engage with customer reviews and feedback
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your Google My Business profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Globe className="h-4 w-4 mr-2" />
            Edit Profile Information
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            View & Respond to Reviews
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Performance Insights
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="h-4 w-4 mr-2" />
            Manage Business Hours
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
