"use client";

import { useState } from "react";
import { Store, Check, ChevronsUpDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActions, useUIState } from "ai/rsc";
import { cn } from "@/lib/utils";
import type { AI } from "@/app/ai";
import { useChatId } from "@/context/ChatIdProvider";

export default function SelectOutlets({ toolCall, items }: { toolCall: string, items: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { continueConversation } = useActions();
  const [selectionLocked, setSelectionLocked] = useState(false); // State to lock selection
  const { chatId, setChatId} = useChatId();
  const handleViewActions = async () => {
    if (!selectedItem) return;
    const { id, name } = selectedItem;
    setSelectionLocked(true);
    if (toolCall === "fetchOutlets") {
      setConversation((currentConversation) => [
        ...currentConversation,
        {
          id: Date.now().toString(),
          display: <div>{`List the Activities for outlet: ${name}`}</div>,
          role: "user",
        },
      ]);
      const ui = await continueConversation(`List activities for the outlet: ${name} with outletID : ${id}`, chatId);
      setConversation((currentConversation) => [...currentConversation, ui]);
    } else if (toolCall === "fetchActivities") {
      setConversation((currentConversation) => [
        ...currentConversation,
        {
          id: Date.now().toString(),
          display: <div>{`Start adding products to cart`}</div>,
          role: "user",
        },
      ]);
      const ui = await continueConversation(`List Products: request products`, chatId);
      setConversation((currentConversation) => [...currentConversation, ui]);
    }
  };

  return (
    <div className="">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {toolCall === "fetchOutlets" ? (
            <Store className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <Activity className="h-6 w-6 text-green-600 dark:text-green-400"/>
          )}
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Select {toolCall === "fetchOutlets" ? "Outlet" : "Activity"}
          </h2>
        </div>

        {/* ShadCN Combobox for Outlet Selection */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              {selectedItem
                ? selectedItem.name
                : toolCall === "fetchOutlets"
                ? "Choose an outlet"
                : "Choose an Activity"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800">
            <Command>
              <CommandInput placeholder="Search outlets..." className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
              <CommandList>
                <CommandEmpty>No outlet found.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => {
                        setSelectedItem({ id: item.id, name: item.name });
                        setOpen(false);
                      }}
                      className="text-gray-800 dark:text-gray-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* View Actions Button */}
        <Button
          onClick={handleViewActions}
          disabled={!selectedItem || selectionLocked}
          className="w-full bg-green-600 hover:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600"
        >
        {toolCall === "fetchActivities" ?  "Select Activity":"View Activities"}
        </Button>
      </Card>
    </div>
  );
}