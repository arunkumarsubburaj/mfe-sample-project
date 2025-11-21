import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-fallback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container my-5">
      <div class="alert alert-warning text-center">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <h4 class="mt-3">Service Under Maintenance</h4>
        <p>This feature is currently unavailable. Please try again later.</p>
      </div>
    </div>
  `
})
export class ErrorFallbackComponent {}
