import { Component, ViewChild, ViewContainerRef, AfterViewInit, Injector, createComponent, EnvironmentInjector, effect, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { InterAppCommunicationService } from 'shared-lib';
import { CartService } from './services/cart.service';
import { DebugLoggerService } from './services/debug-logger.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements AfterViewInit {
  title = 'E-Commerce Microfrontend Shell';
  get debugLogs() { return this.debugLogger.getLogs(); }
  get mfeStatuses() { return this.debugLogger.getMfeStatuses(); }
  isDebugExpanded = signal(false);
  
  @ViewChild('headerContainer', { read: ViewContainerRef }) headerContainer!: ViewContainerRef;

  constructor(
    private injector: EnvironmentInjector,
    private commService: InterAppCommunicationService,
    private cartService: CartService,
    private router: Router,
    public debugLogger: DebugLoggerService
  ) {
    // Listen for add-to-cart messages from Products MFE
    effect(() => {
      const message = this.commService.getMessage('Products', 'add-to-cart')();
      if (message) {
        this.debugLogger.log({
          type: 'message',
          from: 'Products',
          to: 'Shell',
          action: 'Add to cart',
          details: message.content.product.name
        });
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
        const { operation, productId, quantity } = message.content;
        this.debugLogger.log({
          type: 'message',
          from: 'Cart',
          to: 'Shell',
          action: `Cart operation: ${operation}`,
          details: { productId, quantity }
        });
        
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

    // Listen for navigation messages from Header MFE
    effect(() => {
      const message = this.commService.getMessage('Header', 'navigate')();
      if (message) {
        this.debugLogger.log({
          type: 'navigation',
          from: 'Header',
          to: 'Shell',
          action: `Navigate to ${message.content.path}`
        });
        this.router.navigate([message.content.path]);
        this.commService.clearMessage();
      }
    });
  }

  ngAfterViewInit(): void {
    // Load Header MFE after view is initialized
    this.loadHeader();
    
    // Publish initial cart count
    setTimeout(() => this.publishCartUpdate(), 100);
    
    // Initial health check
    this.debugLogger.checkMfeHealth();
    
    // Periodic health check every 10 seconds
    setInterval(() => this.debugLogger.checkMfeHealth(), 10000);
  }

  private publishCartUpdate(): void {
    const count = this.cartService.cartCount();
    this.debugLogger.log({
      type: 'message',
      from: 'Shell',
      to: 'Header',
      action: 'Update cart count',
      details: { count }
    });
    
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
      
      this.debugLogger.log({
        type: 'mfe',
        from: 'Shell',
        action: 'Header MFE loaded successfully'
      });
      this.debugLogger.updateMfeStatus('Header', true);
    } catch (error) {
      console.error('[Shell] Failed to load Header MFE:', error);
      this.debugLogger.updateMfeStatus('Header', false);
    }
  }

  getLogIcon(type: string): string {
    switch (type) {
      case 'navigation': return '🧭';
      case 'message': return '📨';
      case 'cart': return '🛒';
      case 'mfe': return '🔌';
      default: return '📝';
    }
  }

  formatDetails(details: any): string {
    if (typeof details === 'string') return details;
    if (typeof details === 'object') return JSON.stringify(details);
    return String(details);
  }

  getMfeClass(mfeName: string): string {
    const name = mfeName.toLowerCase();
    if (name === 'shell') return 'mfe-shell';
    if (name === 'header') return 'mfe-header';
    if (name === 'products') return 'mfe-products';
    if (name === 'cart') return 'mfe-cart';
    return '';
  }
}
