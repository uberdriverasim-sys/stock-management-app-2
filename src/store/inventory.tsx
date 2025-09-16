import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/supabase'

type InventoryContextType = {
  products: Product[]
  addOrUpdateProduct: (sku: string, name: string, quantity: number) => Promise<{ success: boolean; message: string }>
  removeProduct: (id: string) => Promise<{ success: boolean; message: string }>
  decreaseStock: (productId: string, quantity: number) => Promise<{ success: boolean; message: string }>
  clearAll: () => Promise<{ success: boolean; message: string }>
  totalUnits: number
  loading: boolean
  refreshProducts: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Calculate total units
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0)

  // Load products from Supabase on mount
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      console.log('📦 Loading products from Supabase...')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error loading products:', error)
        return
      }

      console.log('✅ Loaded products:', data?.length || 0)
      setProducts(data || [])
    } catch (err) {
      console.error('💥 Unexpected error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshProducts = async () => {
    await loadProducts()
  }

  const addOrUpdateProduct = async (sku: string, name: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📦 Adding/updating product:', { sku, name, quantity })

      // Check if product with this SKU already exists
      const existingProduct = products.find(p => p.sku.toLowerCase() === sku.toLowerCase())

      if (existingProduct) {
        // Update existing product
        const newQuantity = existingProduct.quantity + quantity
        const { data, error } = await supabase
          .from('products')
          .update({ 
            name, 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProduct.id)
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating product:', error)
          return { success: false, message: error.message }
        }

        console.log('✅ Product updated:', data)
        await refreshProducts()
        return { success: true, message: `Updated ${sku}: added ${quantity} units (total: ${newQuantity})` }
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([{ sku, name, quantity }])
          .select()
          .single()

        if (error) {
          console.error('❌ Error adding product:', error)
          return { success: false, message: error.message }
        }

        console.log('✅ Product added:', data)
        await refreshProducts()
        return { success: true, message: `Added new product: ${sku}` }
      }
    } catch (err) {
      console.error('💥 Error adding/updating product:', err)
      return { success: false, message: 'Failed to add/update product' }
    }
  }

  const removeProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🗑️ Removing product:', id)
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error removing product:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Product removed')
      await refreshProducts()
      return { success: true, message: 'Product removed successfully' }
    } catch (err) {
      console.error('💥 Error removing product:', err)
      return { success: false, message: 'Failed to remove product' }
    }
  }

  const decreaseStock = async (productId: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📉 Decreasing stock:', { productId, quantity })
      
      // Get current product
      const product = products.find(p => p.id === productId)
      if (!product) {
        return { success: false, message: `Product ${productId} not found in inventory` }
      }

      if (product.quantity < quantity) {
        return { success: false, message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}` }
      }

      // Update quantity in database
      const newQuantity = product.quantity - quantity
      const { data, error } = await supabase
        .from('products')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error decreasing stock:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Stock decreased:', data)
      await refreshProducts()
      return { success: true, message: `Successfully dispatched ${quantity} units of ${product.sku}` }
    } catch (err) {
      console.error('💥 Error decreasing stock:', err)
      return { success: false, message: 'Failed to decrease stock' }
    }
  }

  const clearAll = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🧹 Clearing all products...')
      
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', 'impossible-id') // Delete all rows

      if (error) {
        console.error('❌ Error clearing products:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ All products cleared')
      await refreshProducts()
      return { success: true, message: 'All products cleared successfully' }
    } catch (err) {
      console.error('💥 Error clearing products:', err)
      return { success: false, message: 'Failed to clear products' }
    }
  }

  const value: InventoryContextType = {
    products,
    addOrUpdateProduct,
    removeProduct,
    decreaseStock,
    clearAll,
    totalUnits,
    loading,
    refreshProducts
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
