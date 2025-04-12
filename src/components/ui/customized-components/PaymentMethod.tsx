"use client"
import { useState } from "react"
import { ArrowLeft, CreditCard, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useActions, useUIState } from "ai/rsc"
import { AI } from "@/app/ai"
import { useChatId } from "@/context/ChatIdProvider"

interface PaymentOption {
  id: string
  name: string
  description?: string
  logo: string
  additionalLogos?: string[]
}

interface PaymentMethodProps {
  totalAmount?: number
}

export default function PaymentMethod({ totalAmount = 1.0 }: PaymentMethodProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { continueConversation } = useActions();
  const {chatId, setChatId} = useChatId();
  const paymentOptions: PaymentOption[] = [
    
    {
      id: "cards",
      name: "Credit / Debit Card",
      description: "All major cards accepted",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png",
      additionalLogos: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/RuPay_logo.png/1200px-RuPay_logo.png",
      ],
    },
    
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      logo: "https://cdn-icons-png.flaticon.com/512/2331/2331941.png",
    },
  ]

  const handleContinue = async () => {
    if (!selectedPayment) return
    setShowPaymentForm(true)
  }

  const handleProceedToPay = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setConversation((currentConversation) => [
      ...currentConversation,
      {
        id: Date.now().toString(),
        display: <div>{`Order status being confirmed...`}</div>,
        role: "user",
      },
    ]);
    const ui = await continueConversation(`User confirms the order. `, chatId);
    setConversation((currentConversation) => [...currentConversation, ui]);
    // Handle payment processing here
  }


  const handleBackToPaymentMethods = () => {
    setShowPaymentForm(false)
  }

  if (showPaymentForm) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="p-0 shadow-xl border border-gray-200 bg-white overflow-hidden">
         
          {selectedPayment === "cards" && (
            <CardPaymentForm
              onBack={handleBackToPaymentMethods}
              onProceed={handleProceedToPay}
              totalAmount={totalAmount}
            />
          )}
          
          {selectedPayment === "cod" && (
            <CodPaymentForm
              onBack={handleBackToPaymentMethods}
              onProceed={handleProceedToPay}
              totalAmount={totalAmount}
            />
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-4 shadow-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-8 ">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full">
              <span className="text-lg font-bold">$</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
              <p className="text-sm text-gray-500">Choose how you'd like to pay</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium">100% Secure Payments</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-green-700">Your payment is secured by industry-leading encryption</p>
          </div>
        </div>

        <RadioGroup value={selectedPayment || ""} onValueChange={setSelectedPayment} className="space-y-3">
          {paymentOptions.map((option, index) => (
            <div key={option.id} className="relative">
              <div
                className={`
                rounded-lg border-2 transition-all duration-200 
                ${selectedPayment === option.id ? "border-green-500 bg-green-50" : "border-green-200 hover:border-blue-300"}
              `}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={option.id} id={option.id} className="h-4 w-4" />
                    <div className="flex items-center gap-2 flex-1">
                      <img src={option.logo || "/placeholder.svg"} alt={option.name} className="h-6 object-contain" />
                      <div>
                        <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                          {option.name}
                        </Label>
                        {option.description && <p className="text-xs text-gray-500">{option.description}</p>}
                      </div>
                    </div>
                  </div>

                  {option.additionalLogos && (
                    <div className="mt-2 ml-7 flex gap-4">
                      {option.additionalLogos.map((logo, i) => (
                        <img
                          key={i}
                          src={logo || "/placeholder.svg"}
                          alt="Payment option"
                          className="h-5 object-contain opacity-75"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {index < paymentOptions.length - 1 && <div className="my-1" />}
            </div>
          ))}
        </RadioGroup>

        <div className="mt-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedPayment || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-base rounded-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processing...
              </span>
            ) : (
              <>
                Pay ₹{totalAmount.toFixed(2)}
                <span className="ml-2">→</span>
              </>
            )}
          </Button>
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Your personal data is protected by SSL encryption</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

interface PaymentFormProps {
  onBack: () => void
  onProceed: () => void
  totalAmount: number
}

function CardPaymentForm({ onBack, onProceed, totalAmount }: PaymentFormProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-yellow-300 p-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-black">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold text-black">Credit Card</h2>
      </div>

      <div className="p-4 flex-1">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cardNumber" className="text-base font-medium">
              Card Number
            </Label>
            <Input id="cardNumber" placeholder="ENTER 16 DIGIT CARD NUMBER" className="h-10 text-base" />
            <div className="flex gap-2 mt-1">
              <img src="https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" alt="Visa" className="h-5" />
              <img
                src="https://www.mastercard.com/content/dam/public/mastercardcom/na/global-site/images/logos/mc-logo-52.svg"
                alt="Mastercard"
                className="h-5"
              />
              <img src="https://www.rupay.co.in/images/rupay-logo.png" alt="RuPay" className="h-5" />
              <img
                src="https://www.safekey.com/wp-content/uploads/2019/10/safekey-logo.png"
                alt="SafeKey"
                className="h-5"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="expiryMonth" className="text-base font-medium">
                Expiry Date
              </Label>
              <Input id="expiryMonth" placeholder="Month" className="h-10 text-base" />
            </div>

            <div className="space-y-1 pt-6">
              <Input id="expiryYear" placeholder="Year" className="h-10 text-base" />
            </div>

            <div className="space-y-1 pt-6">
              <Input id="cvv" placeholder="CVV" className="h-10 text-base" type="password" maxLength={3} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cardHolderName" className="text-base font-medium">
              Card Holder Name
            </Label>
            <Input id="cardHolderName" placeholder="Card Holder Name" className="h-10 text-base" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mobileNumber" className="text-base font-medium">
              Mobile Number
            </Label>
            <Input id="mobileNumber" placeholder="Mobile Number" className="h-10 text-base" type="tel" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
            <button className="text-blue-600 text-xs font-medium">View detailed bill</button>
          </div>
          <Button
            onClick={onProceed}
            className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-md"
          >
            Proceed to Pay
          </Button>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>Powered By : </span>
            <img src="https://getepay.in/images/logo.png" alt="ePay" className="h-5" />
          </div>
          <span>support@getepay.in</span>
        </div>
      </div>
    </div>
  )
}

function CodPaymentForm({ onBack, onProceed, totalAmount }: PaymentFormProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-yellow-300 p-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 text-black">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold text-black">Cash on Delivery</h2>
      </div>

      <div className="p-4 flex-1">
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
          <p className="text-green-800 text-sm">
            You will pay ₹{totalAmount.toFixed(2)} when your order is delivered. Please keep exact change ready.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="codName" className="text-base font-medium">
              Name
            </Label>
            <Input id="codName" placeholder="Full Name" className="h-10 text-base" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="codMobile" className="text-base font-medium">
              Mobile Number
            </Label>
            <Input id="codMobile" placeholder="Mobile Number" className="h-10 text-base" type="tel" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="codAddress" className="text-base font-medium">
              Delivery Address
            </Label>
            <Input id="codAddress" placeholder="Address" className="h-10 text-base" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
            <button className="text-blue-600 text-xs font-medium">View detailed bill</button>
          </div>
          <Button
            onClick={onProceed}
            className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-md"
          >
            Confirm Order
          </Button>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>Powered By : </span>
            <img src="https://getepay.in/images/logo.png" alt="ePay" className="h-5" />
          </div>
          <span>support@getepay.in</span>
        </div>
      </div>
    </div>
  )
}

function setConversation(arg0: (currentConversation: any) => any[]) {
  throw new Error("Function not implemented.")
}


