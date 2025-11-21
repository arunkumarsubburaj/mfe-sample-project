import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="text-center mb-5">
            <h1 class="display-4 mb-3">
              <i class="bi bi-shop text-primary"></i>
              Welcome to E-Commerce MFE Demo
            </h1>
            <p class="lead text-muted">
              A demonstration of Microfrontend Architecture using Module Federation
            </p>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">
                <i class="bi bi-diagram-3 text-primary"></i>
                Architecture Overview
              </h3>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="p-3 border rounded">
                    <h5 class="mfe-shell-text">
                      <i class="bi bi-hdd-network"></i> 🏠 Shell Application
                    </h5>
                    <p class="small mb-0">Host application that orchestrates all microfrontends</p>
                    <span class="badge mfe-shell">Port 4200</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="p-3 border rounded">
                    <h5 class="mfe-header-text">
                      <i class="bi bi-layout-text-window"></i> 📋 Header MFE
                    </h5>
                    <p class="small mb-0">Navigation bar with cart badge (Module Federation)</p>
                    <span class="badge mfe-header">Port 4201</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="p-3 border rounded">
                    <h5 class="mfe-products-text">
                      <i class="bi bi-grid"></i> 📦 Products MFE
                    </h5>
                    <p class="small mb-0">Product catalog with add-to-cart (Module Federation)</p>
                    <span class="badge mfe-products">Port 4202</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="p-3 border rounded">
                    <h5 class="mfe-cart-text">
                      <i class="bi bi-cart3"></i> 🛒 Cart MFE
                    </h5>
                    <p class="small mb-0">Shopping cart management (Module Federation)</p>
                    <span class="badge mfe-cart">Port 4203</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h3 class="card-title mb-3">
                <i class="bi bi-chat-dots text-primary"></i>
                Inter-MFE Communication
              </h3>
              <p class="mb-3">
                All microfrontends communicate using <strong>NgRx Signal Store</strong>:
              </p>
              <ul class="list-unstyled">
                <li class="mb-2">
                  <i class="bi bi-arrow-right-circle text-primary"></i>
                  Products MFE → Cart MFE: Send product to cart
                </li>
                <li class="mb-2">
                  <i class="bi bi-arrow-right-circle text-primary"></i>
                  Cart MFE → Header MFE: Update cart count badge
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success"></i>
                  Real-time updates across all microfrontends
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px 0;
    }
    .mfe-shell-text {
      color: #0d6efd !important;
    }
    .mfe-header-text {
      color: #6f42c1 !important;
    }
    .mfe-products-text {
      color: #198754 !important;
    }
    .mfe-cart-text {
      color: #fd7e14 !important;
    }
    .badge.mfe-shell {
      background: #0d6efd !important;
      color: white !important;
    }
    .badge.mfe-header {
      background: #6f42c1 !important;
      color: white !important;
    }
    .badge.mfe-products {
      background: #198754 !important;
      color: white !important;
    }
    .badge.mfe-cart {
      background: #fd7e14 !important;
      color: white !important;
    }
  `]
})
export class HomeComponent {}
