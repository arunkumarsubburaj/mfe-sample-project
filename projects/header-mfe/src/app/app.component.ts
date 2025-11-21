import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { InterAppCommunicationService } from 'shared-lib';
import { CommonModule } from '@angular/common';

const CART_STORAGE_KEY = 'mfe-cart-items';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'E-Commerce MFE Demo';
  
  // Signal for cart count
  cartCount = signal(0);

  constructor(private commService: InterAppCommunicationService) {
    // Effect to listen for cart count updates from Shell
    effect(() => {
      const message = this.commService.getMessage('Shell', 'cart-count-updated')();
      if (message?.content?.count !== undefined) {
        console.log('[Header MFE] Cart count updated from Shell:', message.content.count);
        this.cartCount.set(message.content.count);
      }
    });
  }

  ngOnInit(): void {
    // Load cart count from localStorage on init
    this.loadCartCountFromStorage();
    
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === CART_STORAGE_KEY) {
        this.loadCartCountFromStorage();
      }
    });
  }

  private loadCartCountFromStorage(): void {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        const count = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        this.cartCount.set(count);
        console.log('[Header MFE] Loaded cart count from localStorage:', count);
      } else {
        this.cartCount.set(0);
      }
    } catch (error) {
      console.error('[Header MFE] Error loading cart from localStorage:', error);
      this.cartCount.set(0);
    }
  }
}
