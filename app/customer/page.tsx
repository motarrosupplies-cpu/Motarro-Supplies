"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { customerService } from "@/lib/services/customerService";
import { orderService } from "@/lib/services/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import type { User } from '@supabase/supabase-js';
import type { Customer } from '@/lib/services/customerService';
import type { Order } from '@/lib/services/orderService';
import { isAdminEmail } from '@/lib/brand';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || !user.email) {
        router.replace("/login");
        return;
      }
      if (isAdminEmail(user.email)) {
        router.replace("/admin");
        return;
      }
      setUser(user);
      // Fetch customer profile
      const customerData = await customerService.getCustomerByEmail(user.email);
      setCustomer(customerData);
      setProfileForm({
        firstName: customerData?.firstName || "",
        lastName: customerData?.lastName || "",
        phone: customerData?.phone || "",
        street: customerData?.address?.street || "",
        city: customerData?.address?.city || "",
        state: customerData?.address?.state || "",
        zipCode: customerData?.address?.zipCode || "",
        country: customerData?.address?.country || "",
      });
      // Fetch orders
      if (customerData?.id) {
        const ordersData = await orderService.getOrdersByCustomerId(customerData.id);
        setOrders(ordersData);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer?.id) return;
    const updated = await customerService.updateCustomer(customer.id, {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone,
      address: {
        street: profileForm.street,
        city: profileForm.city,
        state: profileForm.state,
        zipCode: profileForm.zipCode,
        country: profileForm.country,
      },
    });
    if (updated) {
      setCustomer(updated);
      setEditMode(false);
      toast({ title: "Profile updated" });
    } else {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!customer) return <div className="flex items-center justify-center min-h-screen">No customer profile found.</div>;

  return (
    <>
      <h1 className="sr-only">My Account – MOTARRO Supplies</h1>
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex gap-4">
                <Input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} placeholder="First Name" required />
                <Input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} placeholder="Last Name" required />
              </div>
              <Input name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="Phone" />
              <Input name="street" value={profileForm.street} onChange={handleProfileChange} placeholder="Street Address" />
              <div className="flex gap-4">
                <Input name="city" value={profileForm.city} onChange={handleProfileChange} placeholder="City" />
                <Input name="state" value={profileForm.state} onChange={handleProfileChange} placeholder="State" />
              </div>
              <div className="flex gap-4">
                <Input name="zipCode" value={profileForm.zipCode} onChange={handleProfileChange} placeholder="Zip Code" />
                <Input name="country" value={profileForm.country} onChange={handleProfileChange} placeholder="Country" />
              </div>
              <div className="flex gap-4">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div><b>Name:</b> {customer.firstName} {customer.lastName}</div>
              <div><b>Email:</b> {customer.email}</div>
              <div><b>Phone:</b> {customer.phone}</div>
              <div><b>Address:</b> {customer.address.street}, {customer.address.city}, {customer.address.state}, {customer.address.zipCode}, {customer.address.country}</div>
              <Button className="mt-2" onClick={() => setEditMode(true)}>Edit Profile</Button>
              <Button className="mt-2 ml-2" variant="destructive" onClick={handleLogout}>Log out</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div>No orders found.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded p-4">
                  <div><b>Order ID:</b> {order.id}</div>
                  <div><b>Status:</b> {order.status}</div>
                  <div><b>Total:</b> R{order.totalAmount}</div>
                  <div><b>Payment Method:</b> {order.paymentMethod}</div>
                  <div><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
} 