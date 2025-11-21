import { Component, ViewChild, ViewContainerRef, AfterViewInit, Injector, createComponent, EnvironmentInjector, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { InterAppCommunicationService } from 'shared-lib';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements AfterViewInit {
  title = 'E-Commerce Microfrontend Shell';
  
  @ViewChild('headerContainer', { read: ViewContainerRef }) headerContainer!: ViewContainerRef;

  constructor(
    private injector: EnvironmentInjector,
    private commService: InterAppCommunicationService,
    private cartService: CartService
  ) {
    // Listen for add-to-cart messages from Products MFE
    effect(() => {
      const message = this.commService.getMessage('Products', 'add-to-cart')();
      if (message) {
        console.log('[Shell] Received add-to-cart message:', message);
        this.cartService.addToCart(message.content.product, message.content.quantity);
        this.commService.clearMessage();
        
        // Publish cart count update to Header
        this.publishCartUpdate();
      }
    });

    // Listen for cart operations from Cart MFE
    effect(() => {
      const message = this.commService.getMessage('Cart', 'cart-operation')();
      if (message) {
        console.log('[Shell] Received cart operation:', message);
        const { operation, productId, quantity } = message.content;
        
        switch (operation) {
          case 'remove':
            this.cartService.removeFromCart(productId);
            break;
          case 'update':
            this.cartService.updateQuantity(productId, quantity);
            break;
          case 'clear':
            this.cartService.clearCart();
            break;
        }
        
        this.commService.clearMessage();
        this.publishCartUpdate();
      }
    });
  }

  ngAfterViewInit(): void {
    // Load Header MFE after view is initialized
    this.loadHeader();
    
    // Publish initial cart count
    setTimeout(() => this.publishCartUpdate(), 100);
  }

  private publishCartUpdate(): void {
    const count = this.cartService.cartCount();
    console.log('[Shell] Publishing cart count:', count);
    
    this.commService.sendMessage({
      from: 'Shell',
      to: 'Header',
      type: 'cart-count-updated',
      content: { count, timestamp: Date.now() }
    }, true);
  }

  async loadHeader(): Promise<void> {
    try {
      // Load the remote header module
      const module = await loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './HeaderComponent'
      });

      // Get the component from the module
      const component = module.AppComponent;
      
      // Clear container and create component
      this.headerContainer.clear();
      const componentRef = createComponent(component, {
        environmentInjector: this.injector,
        elementInjector: this.injector
      });
      
      // Insert into container
      this.headerContainer.insert(componentRef.hostView);
      
      console.log('[Shell] Header MFE loaded successfully');
    } catch (error) {
      console.error('[Shell] Failed to load Header MFE:', error);
    }
  }
}
