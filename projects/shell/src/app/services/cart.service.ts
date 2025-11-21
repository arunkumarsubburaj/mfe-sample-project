import { Injectable, signal, computed } from '@angular/core';
import { Product } from 'shared-lib';

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'mfe-cart-items';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSignal = signal<CartItem[]>([]);
  
  cartItems = this.cartItemsSignal.asReadonly();
  
  cartCount = computed(() => {
    return this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0);
  });

  constructor() {
    this.loadFromStorage();
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === CART_STORAGE_KEY) {
        this.loadFromStorage();
      }
    });

    // Listen for custom cart update events
    window.addEventListener('cart-updated', () => {
      this.loadFromStorage();
    });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        this.cartItemsSignal.set(items);
        console.log('[Shell Cart Service] Loaded', items.length, 'items from storage');
      } else {
        this.cartItemsSignal.set([]);
      }
    } catch (error) {
      console.error('[Shell Cart Service] Error loading from storage:', error);
      this.cartItemsSignal.set([]);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cartItemsSignal()));
      // Dispatch custom event for cross-component updates
      window.dispatchEvent(new CustomEvent('cart-updated'));
      console.log('[Shell Cart Service] Saved to storage');
    } catch (error) {
      console.error('[Shell Cart Service] Error saving to storage:', error);
    }
  }

  addToCart(product: Product, quantity: number = 1): void {
    const items = [...this.cartItemsSignal()];
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    
    this.cartItemsSignal.set(items);
    this.saveToStorage();
    console.log('[Shell Cart Service] Added to cart:', product.name);
  }

  removeFromCart(productId: string): void {
    const items = this.cartItemsSignal().filter(item => item.product.id !== productId);
    this.cartItemsSignal.set(items);
    this.saveToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const items = [...this.cartItemsSignal()];
    const item = items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.cartItemsSignal.set(items);
      this.saveToStorage();
    }
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveToStorage();
  }

  getTotal(): number {
    return this.cartItemsSignal().reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
  }
}
