"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BankDetail {
  id?: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_type?: string;
}

export default function PaymentsAdminPage() {
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<BankDetail>({
    account_holder: "",
    bank_name: "",
    account_number: "",
    branch_code: "",
    account_type: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBankDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/eft-bank-details/");
      const data = await res.json();
      setBankDetails(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load bank details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch("/api/admin/eft-bank-details/", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save bank detail");
      setSuccess(editingId ? "Bank detail updated." : "Bank detail added.");
      setForm({
        account_holder: "",
        bank_name: "",
        account_number: "",
        branch_code: "",
        account_type: "",
      });
      setEditingId(null);
      fetchBankDetails();
    } catch {
      setError("Failed to save bank detail.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (detail: BankDetail) => {
    setForm(detail);
    setEditingId(detail.id || null);
    setSuccess(null);
    setError(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/eft-bank-details/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete bank detail");
      setSuccess("Bank detail deleted.");
      fetchBankDetails();
    } catch {
      setError("Failed to delete bank detail.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      account_holder: "",
      bank_name: "",
      account_number: "",
      branch_code: "",
      account_type: "",
    });
    setEditingId(null);
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Manage EFT Bank Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="account_holder"
                placeholder="Account Holder"
                value={form.account_holder}
                onChange={handleChange}
                required
              />
              <Input
                name="bank_name"
                placeholder="Bank Name"
                value={form.bank_name}
                onChange={handleChange}
                required
              />
              <Input
                name="account_number"
                placeholder="Account Number"
                value={form.account_number}
                onChange={handleChange}
                required
              />
              <Input
                name="branch_code"
                placeholder="Branch Code"
                value={form.branch_code}
                onChange={handleChange}
                required
              />
              <Input
                name="account_type"
                placeholder="Account Type (optional)"
                value={form.account_type}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingId ? "Update" : "Add"} Bank Detail
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          </form>
          <Separator className="mb-4" />
          <h3 className="font-medium mb-2">All Bank Details</h3>
          {loading ? (
            <p>Loading...</p>
          ) : bankDetails.length === 0 ? (
            <p>No bank details found.</p>
          ) : (
            <div className="space-y-4">
              {bankDetails.map((detail) => (
                <div key={detail.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-background">
                  <div>
                    <div><span className="font-medium">Account Holder:</span> {detail.account_holder}</div>
                    <div><span className="font-medium">Bank Name:</span> {detail.bank_name}</div>
                    <div><span className="font-medium">Account Number:</span> {detail.account_number}</div>
                    <div><span className="font-medium">Branch Code:</span> {detail.branch_code}</div>
                    {detail.account_type && <div><span className="font-medium">Account Type:</span> {detail.account_type}</div>}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(detail)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(detail.id)}>
                      Delete
                    </Button>
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