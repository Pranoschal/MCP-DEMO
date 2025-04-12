"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/ai";
import { useChatId } from "@/context/ChatIdProvider";

interface InvoiceProps {
  toolcall: string;
  cartItems: { id: string; name: string; quantity: number; price: number }[];
}

export default function Invoice({ toolcall, cartItems }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { continueConversation } = useActions();
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { chatId, setChatId} = useChatId();
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const orderDate = format(new Date(), "PPPP");
  const totalAmount = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const handleDownload = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("No items in the cart to generate an invoice!");
      return;
    }

    const doc = new jsPDF();

    // Add Invoice Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Invoice", 14, 20);

    // Add Order Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Order No: ${orderNumber}`, 14, 30);
    doc.text(`Date: ${orderDate}`, 14, 40);

    // Add Table with Dynamic Content
    autoTable(doc, {
      startY: 50,
      head: [["Product", "Quantity", "Price", "Total"]],
      body: cartItems.map((item) => [
        item.name,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${(item.quantity * item.price).toFixed(2)}`,
      ]),
      theme: "striped",
      styles: { fontSize: 12, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] }, // Green header
    });

    // Add Total Amount
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFont("helvetica", "bold");
    doc.text(`Total: $${totalAmount.toFixed(2)}`, 14, finalY + 10);

    doc.save(`invoice_${orderNumber}.pdf`);
  };

  const handleContinue = async () => {
    setConversation((currentConversation) => [
      ...currentConversation,
      {
        id: Date.now().toString(),
        display: <div>{`Proceeding to payment...`}</div>,
        role: "user",
      },
    ]);
    const ui = await continueConversation(`Proceed to payment with total amount: ${totalAmount}: Request for payment`, chatId);
    setConversation((currentConversation) => [...currentConversation, ui]);
  };

  return (
    <div className="max-w-screen-md mx-auto p-4 sm:px-6 lg:px-8 min-w-[0px]">
      <div ref={invoiceRef}>
        <Card className="p-4 sm:p-6 md:p-8 shadow-lg border dark:bg-gray-800">
          {/* Header Section */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Invoice</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order No: {orderNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date: {orderDate}</p>
            </div>
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Invoice</span>
            </Button>
          </div>

          {/* Table Section */}
          <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 ">
            <div className="overflow-x-auto">
            <Table className="min-w-[200px]">
                <TableHeader className="bg-gray-100 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-2/5">Product</TableHead>
                    <TableHead className="w-1/5 text-right">Quantity</TableHead>
                    <TableHead className="w-1/5 text-right">Price</TableHead>
                    <TableHead className="w-1/5 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-lg font-semibold text-center sm:text-left">
              Total: <span className="text-green-600 dark:text-green-400">${totalAmount.toFixed(2)}</span>
            </div>
            <Button
              onClick={handleContinue}
              className="w-full sm:w-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            >
              Continue to Payment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
 