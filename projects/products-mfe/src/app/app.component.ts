import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InterAppCommunicationService, Product, MOCK_PRODUCTS } from 'shared-lib';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent {
  title = 'Products Catalog';
  products: Product[] = MOCK_PRODUCTS;
  selectedProduct: Product | null = null;

  constructor(private commService: InterAppCommunicationService) {}

  viewDetails(product: Product): void {
    this.selectedProduct = product;
  }

  closeDetails(): void {
    this.selectedProduct = null;
  }

  addToCart(product: Product): void {
    console.log('[Products MFE] Adding to cart:', product.name);
    
    // Send message to Cart MFE
    this.commService.sendMessage({
      from: 'Products',
      to: 'Cart',
      type: 'add-to-cart',
      content: { product, quantity: 1 }
    }, true);

    // Show success feedback with Bootstrap toast-like notification
    this.showSuccessNotification(`${product.name} added to cart!`);
  }

  private showSuccessNotification(message: string): void {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      ${message}
    `;
    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }
}
