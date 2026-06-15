import { EnhancedMenuManagement } from "@/components/admin/EnhancedMenuManagement"
import { DatabaseStatus } from "@/components/admin/DatabaseStatus"

export default function MenuPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>
      
      {/* Database Status Check */}
      <DatabaseStatus />
      
      {/* Menu Management Component */}
      <EnhancedMenuManagement />
    </div>
  )
} 