import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, CartContextType, Product } from "../types";

const CART_STORAGE_KEY = "a2c_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product._id
      );

      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stockQty
        );
        return currentItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Add new item
      const newItem: CartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: Math.min(quantity, product.stockQty),
        imageUrl: product.imageUrls[0] || "",
        stockQty: product.stockQty,
      };

      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.stockQty) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
