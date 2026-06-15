"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Users, Package, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

interface SchoolEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  eventProducts: EventProduct[];
}

interface EventProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  variants: EventProductVariant[];
  additionalItems?: EventProductAdditionalItem[];
}

interface EventProductAdditionalItem {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isRequired: boolean;
  maxQuantity: number;
  options?: EventProductAdditionalItemOption[];
}

interface EventProductAdditionalItemOption {
  id: string;
  optionName: string;
  optionType: string;
  priceAdjustment: number;
}

interface EventProductVariant {
  id: string;
  size: string;
  color: string;
  additionalPrice: number;
  isActive: boolean;
}

interface CartItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantDetails?: string;
  childName: string;
  childAge: number;
  /** Captured on product card (also echoed at checkout). */
  parentPhone?: string;
  grade?: string;
  className?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  selectedSize?: string;
  selectedVariant?: string;
  selectedAddons?: CartItemAddon[];
}

/** Per-product form before Add to cart */
interface LineDraft {
  childName: string;
  childAge: string;
  parentPhone: string;
  grade: string;
  className: string;
  variantId: string;
  addons: Record<string, { enabled: boolean; optionId: string; quantity: number }>;
}

interface CartItemAddon {
  additionalItemId: string;
  additionalItemName: string;
  selectedOptionId?: string;
  selectedOptionName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function PublicSchoolEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    schoolName: '',
    grade: '',
    className: '',
    specialInstructions: ''
  });

  const [lineDrafts, setLineDrafts] = useState<Record<string, LineDraft>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const buildDraftsForProducts = (products: EventProduct[]): Record<string, LineDraft> => {
    const out: Record<string, LineDraft> = {};
    for (const p of products) {
      const addons: LineDraft["addons"] = {};
      p.additionalItems?.forEach((a) => {
        addons[a.id] = { enabled: !!a.isRequired, optionId: "", quantity: 1 };
      });
      const variants = p.variants?.filter((v) => v.isActive) ?? [];
      out[p.id] = {
        childName: "",
        childAge: "",
        parentPhone: "",
        grade: "",
        className: "",
        variantId: variants.length === 1 ? variants[0].id : "",
        addons,
      };
    }
    return out;
  };

  useEffect(() => {
    if (!event?.eventProducts?.length) return;
    setLineDrafts((prev) => {
      const built = buildDraftsForProducts(event.eventProducts);
      const next: Record<string, LineDraft> = { ...prev };
      for (const pid of Object.keys(built)) {
        if (!next[pid]) next[pid] = built[pid];
        else {
          const mergedAddons = { ...next[pid].addons };
          for (const aid of Object.keys(built[pid].addons)) {
            if (!mergedAddons[aid]) mergedAddons[aid] = built[pid].addons[aid];
          }
          next[pid] = { ...next[pid], addons: mergedAddons };
        }
      }
      return next;
    });
  }, [event?.id, event?.eventProducts]);

  useEffect(() => {
    if (!showCheckout || cart.length === 0) return;
    const first = cart[0];
    const phone = first?.parentPhone?.trim();
    const grade = first?.grade?.trim();
    const cls = first?.className?.trim();
    setCheckoutForm((prev) => ({
      ...prev,
      parentPhone: prev.parentPhone.trim() ? prev.parentPhone : phone || prev.parentPhone,
      grade: prev.grade.trim() ? prev.grade : grade || prev.grade,
      className: prev.className.trim() ? prev.className : cls || prev.className,
    }));
  }, [showCheckout, cart]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/school-events/${params.id}`);
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

  const draftFor = (product: EventProduct): LineDraft =>
    lineDrafts[product.id] ?? buildDraftsForProducts([product])[product.id];

  const patchDraft = (productId: string, patch: Partial<LineDraft>) => {
    setLineDrafts((prev) => {
      const cur = prev[productId] ?? buildDraftsForProducts(event!.eventProducts.filter((p) => p.id === productId))[productId];
      return { ...prev, [productId]: { ...cur, ...patch, addons: patch.addons ?? cur.addons } };
    });
  };

  const patchAddonDraft = (
    productId: string,
    addonId: string,
    patch: Partial<{ enabled: boolean; optionId: string; quantity: number }>
  ) => {
    setLineDrafts((prev) => {
      const cur = prev[productId] ?? buildDraftsForProducts(event!.eventProducts.filter((p) => p.id === productId))[productId];
      const addons = { ...cur.addons };
      addons[addonId] = { ...addons[addonId], ...patch };
      return { ...prev, [productId]: { ...cur, addons } };
    });
  };

  const getAddonTotalPrice = (
    addon: EventProductAdditionalItem,
    selectedOption?: EventProductAdditionalItemOption,
    quantity: number = 1
  ) => {
    const basePrice = addon.basePrice;
    const optionPrice = selectedOption?.priceAdjustment || 0;
    return (basePrice + optionPrice) * quantity;
  };

  const computeDraftLineTotal = (product: EventProduct, d: LineDraft) => {
    let unit = Number(product.basePrice) || 0;
    const variants = product.variants?.filter((v) => v.isActive) ?? [];
    if (variants.length > 0) {
      const v = variants.find((x) => x.id === d.variantId);
      if (v) unit += Number(v.additionalPrice) || 0;
    }
    let addonSum = 0;
    product.additionalItems?.forEach((addon) => {
      const sel = d.addons[addon.id];
      if (!sel?.enabled) return;
      const opt = addon.options?.find((o) => o.id === sel.optionId);
      addonSum += getAddonTotalPrice(addon, opt, sel.quantity);
    });
    return unit + addonSum;
  };

  const addProductToCart = (product: EventProduct) => {
    const d = draftFor(product);
    if (!d.childName.trim()) {
      alert("Please enter the child's name.");
      return;
    }
    const ageNum = parseInt(d.childAge, 10);
    if (Number.isNaN(ageNum) || ageNum < 0) {
      alert("Please enter a valid age.");
      return;
    }
    if (!d.parentPhone.trim()) {
      alert("Please enter the parent's cell number.");
      return;
    }
    if (!d.grade.trim()) {
      alert("Please enter the grade (e.g. Grade 3).");
      return;
    }
    if (!d.className.trim()) {
      alert("Please enter the class (e.g. E or C).");
      return;
    }

    const activeVariants = product.variants?.filter((v) => v.isActive) ?? [];
    let variant: EventProductVariant | undefined;
    if (activeVariants.length > 0) {
      if (!d.variantId) {
        alert("Please select an available option (size / colour).");
        return;
      }
      variant = activeVariants.find((v) => v.id === d.variantId);
      if (!variant) {
        alert("Please select a valid option.");
        return;
      }
    }

    const cartAddons: CartItemAddon[] = [];
    let addonTotal = 0;
    for (const addon of product.additionalItems ?? []) {
      if (!addon.isActive) continue;
      const sel = d.addons[addon.id];
      if (!sel?.enabled) {
        if (addon.isRequired) {
          alert(`"${addon.name}" is required — enable it and choose options if needed.`);
          return;
        }
        continue;
      }
      if (addon.options && addon.options.length > 0 && !sel.optionId) {
        alert(`Please choose an option for "${addon.name}".`);
        return;
      }
      const opt = addon.options?.find((o) => o.id === sel.optionId);
      const lineTotal = getAddonTotalPrice(addon, opt, sel.quantity);
      addonTotal += lineTotal;
      cartAddons.push({
        additionalItemId: addon.id,
        additionalItemName: addon.name,
        selectedOptionId: sel.optionId || undefined,
        selectedOptionName: opt?.optionName,
        quantity: sel.quantity,
        unitPrice: addon.basePrice + (opt?.priceAdjustment || 0),
        totalPrice: lineTotal,
      });
    }

    const baseUnit = variant
      ? Number(product.basePrice) + Number(variant.additionalPrice || 0)
      : Number(product.basePrice) || 0;
    const lineUnit = baseUnit + addonTotal;

    const parts = [
      d.grade.trim() && `Grade: ${d.grade.trim()}`,
      d.className.trim() && `Class: ${d.className.trim()}`,
      d.parentPhone.trim() && `Parent cell: ${d.parentPhone.trim()}`,
    ].filter(Boolean);

    const newItem: CartItem = {
      productId: product.id,
      variantId: variant?.id,
      productName: product.name,
      variantDetails: variant ? `${variant.size} - ${variant.color}` : undefined,
      childName: d.childName.trim(),
      childAge: ageNum,
      parentPhone: d.parentPhone.trim(),
      grade: d.grade.trim(),
      className: d.className.trim(),
      quantity: 1,
      unitPrice: lineUnit,
      totalPrice: lineUnit,
      specialInstructions: parts.length ? parts.join(" • ") : undefined,
      selectedAddons: cartAddons.length ? cartAddons : undefined,
    };

    setCart((prev) => [...prev, newItem]);
    setShowCheckout(true);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, field: keyof CartItem, value: any) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Recalculate total price
      if (field === 'quantity' || field === 'unitPrice') {
        updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
      }
      
      return updated;
    });
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCheckout = async () => {
    const requiredFields = {
      parentName: checkoutForm.parentName?.trim(),
      parentEmail: checkoutForm.parentEmail?.trim(),
      parentPhone: checkoutForm.parentPhone?.trim(),
      schoolName: checkoutForm.schoolName?.trim()
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const orderData = {
        eventId: event?.id,
        parentInfo: {
          name: checkoutForm.parentName,
          email: checkoutForm.parentEmail,
          phone: checkoutForm.parentPhone,
          schoolName: checkoutForm.schoolName,
          grade: checkoutForm.grade,
          className: checkoutForm.className
        },
        orderItems: cart,
        totalAmount: getTotalAmount()
      };
      
      // First, create the order
      const response = await fetch('/api/school-events/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const { orderId, orderNumber: newOrderNumber } = await response.json();
        
        // Show success message
        setOrderNumber(newOrderNumber);
        setOrderSuccess(true);
        
        // Wait a moment to show success message, then redirect to Payfast
        setTimeout(async () => {
          try {
            // Redirect to Payfast checkout
            const payfastResponse = await fetch('/api/payments/payfast-initiate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                total: getTotalAmount(),
                customerId: orderId,
                orderNumber: newOrderNumber,
                customerEmail: checkoutForm.parentEmail,
                customerName: checkoutForm.parentName,
                itemName: `School Event Order - ${event?.name}`,
                customStr1: orderId, // Store order ID for callback
                orderType: 'school-event',
                eventId: event?.id,
              }),
            });

            if (payfastResponse.ok) {
              const { url } = await payfastResponse.json();
              // Redirect to Payfast
              window.location.href = url;
            } else {
              throw new Error('Failed to initiate payment');
            }
          } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Order created but payment initiation failed. Please contact support.');
          }
        }, 2000); // Show success message for 2 seconds
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event || !event.isActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found or Inactive</h1>
          <Button asChild>
            <Link href="/school-events">Back to School Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/school-events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to School Events
            </Link>
          </Button>
        </div>
        
        {/* Event Title and Description */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{event.name}</h1>
          <p className="text-muted-foreground text-lg">{event.description}</p>
        </div>
      </div>

      {/* Event Info Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">School Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Open for Orders</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{event.eventProducts.length} products available</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{cart.length} items in cart</span>
                </div>
                {cart.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium">Total: R{getTotalAmount()?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Available Products</h2>
        
        {event.eventProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
              <p className="text-muted-foreground text-center">
                Products for this event will be available soon. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.eventProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {product.imageUrl && (
                  <div className="aspect-square bg-muted">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      R{product.basePrice?.toFixed(2) || '0.00'}
                    </span>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.isActive && (() => {
                    const d = draftFor(product);
                    const activeVariants = product.variants?.filter((v) => v.isActive) ?? [];
                    const activeAddons = product.additionalItems?.filter((a) => a.isActive) ?? [];
                    return (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`child-${product.id}`}>Child&apos;s name *</Label>
                            <Input
                              id={`child-${product.id}`}
                              value={d.childName}
                              onChange={(e) => patchDraft(product.id, { childName: e.target.value })}
                              placeholder="Enter child's name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`age-${product.id}`}>Child&apos;s age *</Label>
                            <Input
                              id={`age-${product.id}`}
                              type="number"
                              min={0}
                              max={18}
                              value={d.childAge}
                              onChange={(e) => patchDraft(product.id, { childAge: e.target.value })}
                              placeholder="Age"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phone-${product.id}`}>Parent&apos;s cell number *</Label>
                            <Input
                              id={`phone-${product.id}`}
                              type="tel"
                              value={d.parentPhone}
                              onChange={(e) => patchDraft(product.id, { parentPhone: e.target.value })}
                              placeholder="e.g. 082 123 4567"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`grade-${product.id}`}>Grade *</Label>
                            <Input
                              id={`grade-${product.id}`}
                              value={d.grade}
                              onChange={(e) => patchDraft(product.id, { grade: e.target.value })}
                              placeholder="e.g. Grade 3"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`class-${product.id}`}>Class *</Label>
                            <Input
                              id={`class-${product.id}`}
                              value={d.className}
                              onChange={(e) => patchDraft(product.id, { className: e.target.value })}
                              placeholder="e.g. E, C"
                            />
                          </div>
                        </div>

                        {activeVariants.length > 0 && (
                          <div className="space-y-2">
                            <Label>Available options *</Label>
                            <RadioGroup
                              value={d.variantId}
                              onValueChange={(v) => patchDraft(product.id, { variantId: v })}
                              className="grid gap-2"
                            >
                              {activeVariants.map((variant) => (
                                <label
                                  key={variant.id}
                                  htmlFor={`${product.id}-var-${variant.id}`}
                                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${
                                    d.variantId === variant.id ? "border-primary bg-primary/5" : "border-border"
                                  }`}
                                >
                                  <RadioGroupItem value={variant.id} id={`${product.id}-var-${variant.id}`} />
                                  <span className="flex-1 font-medium">
                                    {variant.size} - {variant.color}
                                  </span>
                                  <span className="text-muted-foreground shrink-0">
                                    +R{(variant.additionalPrice ?? 0).toFixed(2)}
                                  </span>
                                </label>
                              ))}
                            </RadioGroup>
                          </div>
                        )}

                        {activeAddons.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Additional items</h4>
                            {activeAddons.map((addon) => {
                              const sel = d.addons[addon.id] ?? {
                                enabled: !!addon.isRequired,
                                optionId: "",
                                quantity: 1,
                              };
                              return (
                                <div key={addon.id} className="space-y-2 rounded-md border p-3">
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      id={`${product.id}-addon-${addon.id}`}
                                      checked={sel.enabled}
                                      disabled={addon.isRequired}
                                      onCheckedChange={(checked) =>
                                        patchAddonDraft(product.id, addon.id, { enabled: checked === true })
                                      }
                                      className="mt-0.5"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <label
                                        htmlFor={`${product.id}-addon-${addon.id}`}
                                        className="cursor-pointer text-sm font-medium"
                                      >
                                        {addon.name}
                                        {addon.isRequired && (
                                          <Badge variant="secondary" className="ml-2 text-[10px]">
                                            Required
                                          </Badge>
                                        )}
                                      </label>
                                      {addon.description && (
                                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        Base R{addon.basePrice?.toFixed(2) ?? "0.00"}
                                      </p>
                                    </div>
                                  </div>
                                  {sel.enabled && (
                                    <>
                                      {addon.options && addon.options.length > 0 && (
                                        <div>
                                          <Label className="text-xs">
                                            {addon.options[0]?.optionType || "Option"}
                                          </Label>
                                          <Select
                                            value={sel.optionId || undefined}
                                            onValueChange={(optionId) =>
                                              patchAddonDraft(product.id, addon.id, { optionId })
                                            }
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue placeholder="Choose option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {addon.options.map((option) => (
                                                <SelectItem key={option.id} value={option.id}>
                                                  {option.optionName}
                                                  {option.priceAdjustment !== 0 && (
                                                    <span className="text-muted-foreground">
                                                      {option.priceAdjustment > 0 ? " +" : " "}
                                                      R{option.priceAdjustment?.toFixed(2) ?? "0.00"}
                                                    </span>
                                                  )}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Label className="text-xs">Quantity</Label>
                                        <Input
                                          type="number"
                                          min={1}
                                          max={addon.maxQuantity}
                                          value={sel.quantity}
                                          onChange={(e) => {
                                            const n = parseInt(e.target.value, 10);
                                            const q = Number.isNaN(n)
                                              ? 1
                                              : Math.min(addon.maxQuantity, Math.max(1, n));
                                            patchAddonDraft(product.id, addon.id, { quantity: q });
                                          }}
                                          className="h-8 w-16 text-xs"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                          Max {addon.maxQuantity}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t pt-3 text-sm">
                          <span className="text-muted-foreground">Line total</span>
                          <span className="font-semibold text-primary">
                            R{computeDraftLineTotal(product, d).toFixed(2)}
                          </span>
                        </div>

                        <Button type="button" className="w-full" onClick={() => addProductToCart(product)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to cart
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Section */}
      {showCheckout && cart.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {orderSuccess ? 'Order Created Successfully!' : 'Complete Your Order'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowCheckout(false)}>
                  ×
                </Button>
              </div>

              {orderSuccess ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold mb-2">Order #{orderNumber} Created!</h3>
                  <p className="text-muted-foreground mb-4">
                    Redirecting you to Payfast to complete payment...
                  </p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold">Order Items ({cart.length})</h3>
                    {cart.map((item, index) => (
                      <div key={index} className="flex flex-col gap-2 rounded border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{item.productName}</div>
                            {item.variantDetails && (
                              <div className="text-sm text-muted-foreground">Option: {item.variantDetails}</div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {item.childName} · age {item.childAge}
                              {item.grade ? ` · ${item.grade}` : ""}
                              {item.className ? ` · class ${item.className}` : ""}
                            </div>
                            {item.parentPhone && (
                              <div className="text-xs text-muted-foreground">Cell: {item.parentPhone}</div>
                            )}
                            {item.specialInstructions && (
                              <div className="mt-1 text-xs text-muted-foreground">{item.specialInstructions}</div>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartItem(index, "quantity", parseInt(e.target.value, 10) || 1)
                              }
                              className="w-16"
                            />
                            <span className="font-medium">R{item.totalPrice?.toFixed(2) ?? "0.00"}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeFromCart(index)}
                              className="text-red-600"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="rounded bg-muted/50 p-3">
                            <h4 className="mb-2 text-sm font-medium">Add-ons</h4>
                            <div className="space-y-2">
                              {item.selectedAddons.map((addon, addonIndex) => (
                                <div
                                  key={addonIndex}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div>
                                    <span className="font-medium">{addon.additionalItemName}</span>
                                    {addon.selectedOptionName && (
                                      <span className="ml-2 text-muted-foreground">
                                        ({addon.selectedOptionName})
                                      </span>
                                    )}
                                    <span className="ml-2 text-muted-foreground">×{addon.quantity}</span>
                                  </div>
                                  <span className="font-medium">
                                    R{addon.totalPrice?.toFixed(2) ?? "0.00"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="text-right text-lg font-bold">
                      Total: R{getTotalAmount()?.toFixed(2) || "0.00"}
                    </div>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parentName">Parent Name *</Label>
                        <Input
                          id="parentName"
                          value={checkoutForm.parentName}
                          onChange={(e) =>
                            setCheckoutForm((prev) => ({ ...prev, parentName: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentEmail">Email *</Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={checkoutForm.parentEmail}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentPhone">Phone *</Label>
                        <Input
                          id="parentPhone"
                          type="tel"
                          value={checkoutForm.parentPhone}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="schoolName">School Name *</Label>
                        <Input
                          id="schoolName"
                          value={checkoutForm.schoolName}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, schoolName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Input
                          id="grade"
                          value={checkoutForm.grade}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, grade: e.target.value }))}
                          placeholder="e.g., Grade 5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="className">Class</Label>
                        <Input
                          id="className"
                          value={checkoutForm.className}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, className: e.target.value }))}
                          placeholder="e.g., Class A"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="specialInstructions">Special Instructions</Label>
                      <Textarea
                        id="specialInstructions"
                        value={checkoutForm.specialInstructions}
                        onChange={(e) => setCheckoutForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        placeholder="Any special requirements or notes..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Place Order - R{getTotalAmount()?.toFixed(2) || '0.00'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCheckout(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
