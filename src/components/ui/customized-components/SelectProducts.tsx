"use client";

import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useActions, useUIState } from "ai/rsc";
import { AI } from "@/app/ai";
import { useChatId } from "@/context/ChatIdProvider";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function ProductSelector({ products }: { products: { id: string; name: string; price: number }[] }) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { continueConversation } = useActions();
  const [selectionLocked, setSelectionLocked] = useState(false);
  const { chatId, setChatId} = useChatId();
  const handleAddProduct = () => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        setCart([...cart, { 
          id: product.id, 
          name: product.name, 
          quantity: Number.parseInt(quantity) || 1, 
          price: product.price
        }]);
        setSelectedProduct("");
        setQuantity("1");
      }
    }
  };

  const handleDeleteProduct = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleQuantityChange = (index: number, newQuantity: string) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = Number.parseInt(newQuantity) || 1;
    setCart(updatedCart);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;

    const formattedCart = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    setSelectionLocked(true);
    setConversation((currentConversation) => [
      ...currentConversation,
      {
        id: Date.now().toString(),
        display: <div>{`Generating invoice for your cart...`}</div>,
        role: "user",
      },
    ]);

    const ui = await continueConversation(
      JSON.stringify({
        tool: "orderSummary",
        params: { cartItems: formattedCart },
      }), chatId
    );

    setConversation((currentConversation) => [...currentConversation, ui]);
    setCart([]);
  };

  const availableProducts = products.filter((product) => !cart.some((item) => item.id === product.id));

  return (
    <div className="">
      <Card className="w-full max-w-xl shadow-sm border rounded-lg p-6 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-8">
          <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Product Selector</h2>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400 mb-2">Your cart is empty</div>
            <div className="text-gray-500 dark:text-gray-500 text-sm">Add some products to get started.</div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Price: {item.price}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity.toString()}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(index)}>
                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              {availableProducts.map((product) => (
                <SelectItem
                  key={product.id}
                  value={product.id}
                  className="text-gray-900 dark:text-gray-100"
                >
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Qty"
          />

          <Button onClick={handleAddProduct} disabled={!selectedProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600"
          onClick={handleSubmit}
          disabled={cart.length === 0 || selectionLocked}
        >
          Submit Order
        </Button>
      </Card>
    </div>
  );
}
 