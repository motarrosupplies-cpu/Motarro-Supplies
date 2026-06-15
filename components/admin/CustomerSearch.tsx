import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import { customerService, Customer } from '@/lib/services/customerService';

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void;
  onAddNew: () => void;
  placeholder?: string;
  disableAddNew?: boolean;
}

function CustomerSearch({ onCustomerSelect, onAddNew, placeholder = "Search customers...", disableAddNew = false }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredCustomers(customers.slice(0, 10)); // Show first 10 customers
    } else {
      const filtered = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(query.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone?.includes(query) ||
        customer.company?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCustomers(filtered.slice(0, 10));
    }
  }, [query, customers]);

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            placeholder={placeholder}
            className="pl-10"
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddNew}
          title="Add new customer"
          disabled={disableAddNew}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {query.trim() === '' ? 'No customers found' : 'No customers match your search'}
            </div>
          ) : (
            <div className="py-1">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {customer.email}
                    {customer.phone && ` • ${customer.phone}`}
                    {customer.company && ` • ${customer.company}`}
                  </div>
                </button>
              ))}
              {customers.length > 10 && (
                <div className="px-4 py-2 text-sm text-muted-foreground border-t">
                  Showing {filteredCustomers.length} of {customers.length} customers
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerSearch; 