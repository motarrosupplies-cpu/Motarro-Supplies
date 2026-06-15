"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"

interface DatabaseStatus {
  status: string
  message: string
  tables: {
    menu_items: string
    product_categories: string
  }
  sample_data_count: number
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/admin/test-db")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || errorData.message || "Failed to check database"
        )
      }
      
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  const getStatusIcon = (tableStatus: string) => {
    switch (tableStatus) {
      case "accessible":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (tableStatus: string) => {
    switch (tableStatus) {
      case "accessible":
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Checking database status...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {status && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {status.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{status.message}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Menu Items</span>
                  {getStatusIcon(status.tables.menu_items)}
                </div>
                {getStatusBadge(status.tables.menu_items)}
              </div>

              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Product Categories</span>
                  {getStatusIcon(status.tables.product_categories)}
                </div>
                {getStatusBadge(status.tables.product_categories)}
              </div>
            </div>

            {status.sample_data_count > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Found {status.sample_data_count} menu items in the database
                </p>
              </div>
            )}

            <Button onClick={checkDatabase} variant="outline" className="w-full">
              Refresh Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 