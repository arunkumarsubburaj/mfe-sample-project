import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterAppCommunicationService, Product } from 'shared-lib';

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'mfe-cart-items';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'Shopping Cart';
  cartItems: CartItem[] = [];

  constructor(private commService: InterAppCommunicationService) {
    // Listen for add-to-cart messages from Products MFE
    effect(() => {
      const message = this.commService.getMessage('Products', 'add-to-cart')();
      if (message) {
        console.log('[Cart MFE] Received add-to-cart message:', message);
        this.addToCart(message.content.product, message.content.quantity);
        this.commService.clearMessage();
      }
    });
  }

  ngOnInit(): void {
    // Load cart from localStorage
    this.loadCartFromStorage();
    
    // Listen for storage events (updates from shell)
    window.addEventListener('storage', (event) => {
      if (event.key === CART_STORAGE_KEY) {
        this.loadCartFromStorage();
      }
    });

    // Listen for custom cart-updated events
    window.addEventListener('cart-updated', () => {
      this.loadCartFromStorage();
    });
  }

  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        this.cartItems = JSON.parse(stored);
        console.log('[Cart MFE] Loaded cart from localStorage:', this.cartItems.length, 'items');
      } else {
        this.cartItems = [];
      }
    } catch (error) {
      console.error('[Cart MFE] Error loading cart from localStorage:', error);
      this.cartItems = [];
    }
  }

  addToCart(product: Product, quantity: number = 1): void {
    // This method is kept for compatibility but operations are handled by shell
    console.log('[Cart MFE] Add to cart called (handled by shell)');
  }

  removeFromCart(productId: string): void {
    // Send operation to shell
    this.commService.sendMessage({
      from: 'Cart',
      to: 'Shell',
      type: 'cart-operation',
      content: { operation: 'remove', productId }
    }, true);
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
    } else {
      // Send operation to shell
      this.commService.sendMessage({
        from: 'Cart',
        to: 'Shell',
        type: 'cart-operation',
        content: { operation: 'update', productId, quantity: newQuantity }
      }, true);
    }
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart(): void {
    // Send operation to shell
    this.commService.sendMessage({
      from: 'Cart',
      to: 'Shell',
      type: 'cart-operation',
      content: { operation: 'clear' }
    }, true);
  }
}
