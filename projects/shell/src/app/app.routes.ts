import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { initFederation } from '@angular-architects/native-federation';
import { HomeComponent } from './components/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'products',
    loadComponent: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4202/remoteEntry.js',
        exposedModule: './ProductsComponent'
      }).then(m => m.AppComponent)
      .catch(err => {
        console.error('Failed to load Products MFE:', err);
        return import('./components/error-fallback.component').then(m => m.ErrorFallbackComponent);
      })
  },
  {
    path: 'cart',
    loadComponent: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4203/remoteEntry.js',
        exposedModule: './CartComponent'
      }).then(m => m.AppComponent)
      .catch(err => {
        console.error('Failed to load Cart MFE:', err);
        return import('./components/error-fallback.component').then(m => m.ErrorFallbackComponent);
      })
  }
];
