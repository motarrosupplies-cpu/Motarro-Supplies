"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { Product } from "@/types/product"
import { orderService } from '@/lib/services/orderService'
import { customerService } from '@/lib/services/customerService'
import { formatCurrency } from '@/lib/utils'
import { GoogleCustomerReviewsOptIn } from '@/components/GoogleCustomerReviewsOptIn'
import { trackGa4Purchase } from '@/lib/ga4'
import { trackMetaInitiateCheckout, trackMetaPurchase } from '@/lib/meta-pixel'
import { PaymentMethodBadges } from '@/components/payment-method-badges'

export default function CheckoutPage() {
  const { items: cartItems, getCartTotal, clearCart } = useCart()
  const subtotal = getCartTotal()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [orderId, setOrderId] = useState<string>("")
  const [confirmationEmail, setConfirmationEmail] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'eft'>('payfast')
  const [bankDetails, setBankDetails] = useState<any[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [bankError, setBankError] = useState<string | null>(null)
  const [discountCode, setDiscountCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [validatingDiscount, setValidatingDiscount] = useState(false)

  useEffect(() => {
    if (cartItems.length === 0) return
    trackMetaInitiateCheckout(
      cartItems.map((item) => ({ id: item.id, quantity: item.quantity || 1 })),
      getFinalTotal()
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (paymentMethod === 'eft') {
      setLoadingBanks(true)
      fetch('/api/admin/eft-bank-details/')
        .then(res => res.json())
        .then(data => {
          setBankDetails(Array.isArray(data) ? data : [])
          setBankError(null)
        })
        .catch(() => setBankError('Failed to load bank details.'))
        .finally(() => setLoadingBanks(false))
    }
  }, [paymentMethod])

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code')
      return
    }

    setValidatingDiscount(true)
    setDiscountError(null)

    try {
      const form = formRef.current
      const email = form ? (form.querySelector('#email') as HTMLInputElement)?.value : ''
      
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), email })
      })

      const result = await response.json()

      if (result.valid) {
        setDiscountPercent(result.discountPercent)
        setDiscountError(null)
      } else {
        setDiscountError(result.error || 'Invalid discount code')
        setDiscountPercent(null)
      }
    } catch (error) {
      setDiscountError('Failed to validate discount code')
      setDiscountPercent(null)
    } finally {
      setValidatingDiscount(false)
    }
  }

  const getDiscountAmount = () => {
    if (!discountPercent) return 0
    return (subtotal * discountPercent) / 100
  }

  const getFinalTotal = () => {
    const shippingCost = shippingMethod === 'standard' ? (subtotal >= 1000 ? 0 : 99.99) : 199.99
    const discount = getDiscountAmount()
    return subtotal + shippingCost - discount
  }

  if (cartItems.length === 0 && !isComplete) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-4">You need to add items to your cart before checking out.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Thank you for your purchase. Your order has been confirmed and will be shipped soon.</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Order #{orderId}</p>
              <p className="text-sm text-muted-foreground">A confirmation email has been sent to your email address.</p>
            </div>
            <GoogleCustomerReviewsOptIn
              orderId={orderId}
              email={confirmationEmail}
              deliveryCountry="ZA"
            />
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Only handle EFT orders in this function
    if (paymentMethod !== 'eft') {
      return
    }
    
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const shippingCost = shippingMethod === 'standard' ? (subtotal >= 1000 ? 0 : 99.99) : 199.99
      const discount = getDiscountAmount()
      const total = subtotal + shippingCost - discount

      // Check if customer already exists
      const email = formData.get('email') as string
      let customer = await customerService.getCustomerByEmail(email)

      if (!customer) {
        customer = await customerService.createCustomer({
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email,
          phone: formData.get('phone') as string,
          address: {
            street: `${formData.get('address')} ${formData.get('apartment') || ''}`.trim(),
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            zipCode: formData.get('zip') as string,
            country: 'South Africa',
          },
        })
      }

      if (!customer) {
        throw new Error('Failed to create or fetch customer.');
      }

      // Create EFT order using the new API
      const response = await fetch('/api/orders/eft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            price: Number(item.price) || 0,
            quantity: item.quantity || 1,
            selectedColorId: item.selectedColor ? item.selectedColor : undefined,
            selectedColor: item.selectedColor,
            selectedSizeId: item.selectedSize ? item.selectedSize : undefined,
            selectedSize: item.selectedSize,
            customPrinting:
              (item as any).kevro ??
              (item as any).titanJet ??
              (item.customPrinting ? item.customPrinting : undefined),
          })),
          total,
          shippingCost,
          discountCode: discountCode.trim() || undefined,
          discountAmount: discount,
          shippingAddress: customer.address,
          specialInstructions: formData.get('specialInstructions') as string || undefined,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create EFT order');
      }

      trackMetaPurchase({
        orderId: data.orderId,
        value: total,
        contentIds: cartItems.map((item) => item.id),
        numItems: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
      })
      trackGa4Purchase({
        transactionId: data.orderId,
        value: total,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: item.quantity || 1,
        })),
      })

      setOrderId(data.orderId)
      setConfirmationEmail(email)
      setIsComplete(true)
      clearCart()
    } catch (error) {
      console.error('Error creating EFT order:', error)
      alert('Error: ' + (error as any).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayfastCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Validate cart is not empty
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }

      // Prepare order data (reuse logic from handleSubmit, but don't create order yet)
      const form = formRef.current;
      if (!form) {
        throw new Error('Form not found. Please refresh the page and try again.');
      }
      
      const formData = new FormData(form);
      
      // Validate required fields
      const email = formData.get('email') as string;
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const phone = formData.get('phone') as string;
      const address = formData.get('address') as string;
      const city = formData.get('city') as string;
      const state = formData.get('state') as string;
      const zip = formData.get('zip') as string;

      if (!email || !firstName || !lastName || !phone || !address || !city || !state || !zip) {
        throw new Error('Please fill in all required fields.');
      }

      const shippingCost = shippingMethod === 'standard' ? (subtotal >= 1000 ? 0 : 99.99) : 199.99;
      const discount = getDiscountAmount();
      const total = subtotal + shippingCost - discount;

      let customer = await customerService.getCustomerByEmail(email);
      if (!customer) {
        customer = await customerService.createCustomer({
          firstName,
          lastName,
          email,
          phone,
          address: {
            street: `${address} ${formData.get('apartment') || ''}`.trim(),
            city,
            state,
            zipCode: zip,
            country: 'South Africa',
          },
        });
      }
      if (!customer) {
        throw new Error('Failed to create or fetch customer. Please try again.');
      }

      // Prepare order payload (customerEmail required for Payfast)
      const orderPayload = {
        customerId: customer.id,
        customerEmail: email,
        items: cartItems.map(item => ({
          id: `ITEM${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`.toUpperCase(),
          productId: item.id,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: item.quantity || 1,
          selectedColorId: item.selectedColor ? item.selectedColor : undefined,
          selectedColor: item.selectedColor,
          selectedSizeId: item.selectedSize ? item.selectedSize : undefined,
          selectedSize: item.selectedSize,
          customPrinting:
            (item as any).kevro ??
            (item as any).titanJet ??
            (item.customPrinting ? item.customPrinting : undefined),
        })),
        total,
        shippingCost,
        discountCode: discountCode.trim() || undefined,
        discountAmount: getDiscountAmount(),
        paymentMethod: 'payfast',
        shippingAddress: customer.address,
        specialInstructions: formData.get('specialInstructions') as string || undefined,
      };

      // Call backend to get Payfast URL
      const res = await fetch('/api/payments/payfast-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || 'Failed to initiate Payfast payment');
      }

      const data = await res.json();
      
      if (!data || !data.url) {
        throw new Error('Invalid response from payment server. Please try again.');
      }

      // Redirect to Payfast
      window.location.href = data.url;
    } catch (error) {
      console.error('Payfast checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cart">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-white rounded-2xl border-2 border-primary/20">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="font-medium">Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Lock className="w-5 h-5 text-blue-600" />
          <span className="font-medium">100% Safe</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="font-medium">Quality Guaranteed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <span className="font-medium">Multiple Payment Options</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input id="apartment" name="apartment" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select name="state" defaultValue="">
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gauteng">Gauteng</SelectItem>
                          <SelectItem value="western-cape">Western Cape</SelectItem>
                          <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                          <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                          <SelectItem value="limpopo">Limpopo</SelectItem>
                          <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                          <SelectItem value="north-west">North West</SelectItem>
                          <SelectItem value="free-state">Free State</SelectItem>
                          <SelectItem value="northern-cape">Northern Cape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" name="zip" required />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-4">Payment Method</h2>
                <Tabs defaultValue="payfast" onValueChange={(value) => setPaymentMethod(value as 'payfast' | 'eft')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payfast">Payfast</TabsTrigger>
                    <TabsTrigger value="eft">EFT (Bank Transfer)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="payfast" className="pt-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="mb-2 max-w-md">
                        You will be redirected to Payfast to complete your purchase securely.
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground max-w-md">
                        Pay with card, Instant EFT, Ozow, or Google Pay — one-tap checkout with saved cards on
                        Android, Chrome, and iOS.
                      </p>
                      <PaymentMethodBadges className="mb-6" highlightGooglePay />
                      <Button
                        type="button"
                        className="w-full"
                        onClick={handlePayfastCheckout}
                        disabled={isSubmitting}
                      >
                        Continue with Payfast
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="eft" className="pt-4">
                    <div className="flex flex-col space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Bank Transfer (EFT)</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Please use your Order ID as the payment reference. Your order will be processed once payment is received.
                        </p>
                        {loadingBanks ? (
                          <p>Loading bank details...</p>
                        ) : bankError ? (
                          <p className="text-red-500">{bankError}</p>
                        ) : bankDetails.length === 0 ? (
                          <p>No bank details available. Please contact support.</p>
                        ) : (
                          <div className="space-y-4">
                            {bankDetails.map((bank, idx) => (
                              <div key={bank.id || idx} className="border rounded p-3 bg-background">
                                <div><span className="font-medium">Account Holder:</span> {bank.account_holder}</div>
                                <div><span className="font-medium">Bank Name:</span> {bank.bank_name}</div>
                                <div><span className="font-medium">Account Number:</span> {bank.account_number}</div>
                                <div><span className="font-medium">Branch Code:</span> {bank.branch_code}</div>
                                {bank.account_type && <div><span className="font-medium">Account Type:</span> {bank.account_type}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          className="w-full"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : "Place Order"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-4">Discount Code</h2>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="discountCode"
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase())
                        setDiscountError(null)
                        if (discountPercent) setDiscountPercent(null)
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={validatingDiscount || !discountCode.trim()}
                    >
                      {validatingDiscount ? 'Validating...' : 'Apply'}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-sm text-red-600">{discountError}</p>
                  )}
                  {discountPercent && (
                    <p className="text-sm text-green-600">
                      ✓ {discountPercent}% discount applied!
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-4">Shipping Method</h2>
                <RadioGroup 
                  defaultValue="standard" 
                  className="space-y-3"
                  onValueChange={(value) => setShippingMethod(value)}
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1">
                      <div className="flex justify-between">
                        <span>Standard Shipping</span>
                        <span>{subtotal >= 1000 ? "Free" : formatCurrency(99.99)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {subtotal >= 1000 
                          ? "Free shipping on orders over R1000"
                          : "Delivery in 5-7 business days"}
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1">
                      <div className="flex justify-between">
                        <span>Express Shipping</span>
                        <span>{formatCurrency(199.99)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Delivery in 2-3 business days
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Special Instructions</h2>
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Add any special instructions for your order (optional)</Label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    className="w-full min-h-[100px] p-3 border rounded-lg resize-y"
                    placeholder="E.g., delivery preferences, gift notes, or any other special requests"
                  />
                </div>
              </div>

              <div className="lg:hidden">
                <OrderSummary 
                  cartItems={cartItems} 
                  subtotal={subtotal} 
                  shippingMethod={shippingMethod}
                  discountPercent={discountPercent}
                  discountCode={discountCode}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <OrderSummary 
            cartItems={cartItems} 
            subtotal={subtotal} 
            shippingMethod={shippingMethod}
            discountPercent={discountPercent}
            discountCode={discountCode}
          />
        </div>
      </div>
    </div>
  )
}

interface OrderSummaryProps {
  cartItems: Product[]
  subtotal: number
  shippingMethod: string
  discountPercent?: number | null
  discountCode?: string
}

function OrderSummary({ cartItems, subtotal, shippingMethod, discountPercent, discountCode }: OrderSummaryProps) {
  const getShippingCost = () => {
    if (shippingMethod === "express") {
      return 199.99
    }
    return subtotal >= 1000 ? 0 : 99.99
  }

  const shippingCost = getShippingCost()
  const discountAmount = discountPercent ? (subtotal * discountPercent) / 100 : 0
  const total = subtotal + shippingCost - discountAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {cartItems.map((item: Product) => (
            <div key={`${item.id}-${item.variantId ?? ''}-${item.selectedSize ?? ''}-${item.selectedColor ?? ''}`} className="flex justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.quantity || 1} ×</span>
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium">R{((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>R{subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount {discountCode && `(${discountCode})`}</span>
            <span>-R{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>R{total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}