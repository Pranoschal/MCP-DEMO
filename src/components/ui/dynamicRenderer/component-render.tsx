import pb from '@/lib/pocketbase';
import * as esbuild from "esbuild-wasm/esm/browser";
import React, { useMemo } from 'react';
import { useState,useEffect } from 'react';
import dynamic from 'next/dynamic'; 
import { ChevronDown, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import * as Babel from '@babel/standalone';
import * as icons from 'lucide-react';
import { User, Bot } from 'lucide-react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table";
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
  } from "@/components/ui/dropdown-menu";
  import { Input } from "@/components/ui/input";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from "@/components/ui/table"
  import { z } from "zod"
  import { useForm } from "react-hook-form"
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import type { AI } from "@/app/ai";
import { useChatId } from "@/context/ChatIdProvider";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActions, useAIState, useUIState } from "ai/rsc";
import { cn } from "@/lib/utils";
import { Store, Check, ChevronsUpDown, Activity } from "lucide-react";
  
const createColumns = (tableData: any) => {
  if (!tableData.length) return [];

  return Object.keys(tableData[0]).map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    cell: ({ row }: any) => {
      const value = row.getValue(key);

      if (value instanceof Date) {
        return value.toLocaleString();
      }
      if (value === null || value === undefined) {
        return "N/A";
      }
      return value.toString();
    },
  }));
};

  export const ComponentRenderer = ({ 
    tsxString, 
    props = {} 
  }: { 
    tsxString: string; 
    props?: Record<string, any>
  }) => {
    console.log(props,'PROPSSSSSSSSSSSSS')
    const DynamicComponent = useMemo(() => {
      return dynamic(() => 
        Promise.resolve(() => {
          const Component = renderTsxString(tsxString);
          return Component ? <Component {...props} /> : <div>Failed to render component</div>;
        }),
        { ssr: false }
      );
    }, [tsxString, Object.entries(props).toString()]); 
    return <DynamicComponent />;
  };


  const transformTsxToJs = (tsxString:string) => {
    try {
      return Babel.transform(tsxString, {
        filename: 'virtual-file.tsx', // Add this line to fix the error
        presets: ['react', 'typescript'],
        plugins: ['transform-modules-commonjs']
      }).code;
    } catch (error) {
      console.error('Error transforming TSX:', error);
      return null;
    }
  };


const renderTsxString = (tsxString:string, dependencies = {}) => {
  const jsCode = transformTsxToJs(tsxString);
  
  if (!jsCode) return null;
  const components = {
    React,
    Card, 
    CardTitle, 
    CardContent,
    icons,
    Label,
    Button,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Input,
    ChevronDown,
    createColumns,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    z,
    useState,
    useEffect,
    useMemo,
    useForm,
    useChatId,
    Command,
    CommandEmpty, 
    CommandGroup, 
    CommandInput, 
    CommandItem, 
    CommandList,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useActions,
    useAIState,
    useUIState,
    cn,
    Store,
    Check,
    ChevronsUpDown,
    Activity,
    ShoppingCart,
    Plus,
    Trash2,
    pb,
    ...dependencies
  };
  
  try {
    const ComponentFunction = new Function(
      ...Object.keys(components),
      `const module = {exports: {}}; const exports = module.exports; ${jsCode}; return module.exports.default || exports.default;`
    );
    console.log(ComponentFunction(...Object.values(components)),'COMPONENT FUNCTION')
    return ComponentFunction(...Object.values(components));
  } catch (error) {
    console.error('Error rendering transformed JS:', error);
    return null;
  }
};