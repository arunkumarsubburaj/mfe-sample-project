import {
  Component,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
  ViewContainerRef,
} from '@angular/core';
import { loadRemote } from '@module-federation/enhanced/runtime';

@Injectable({
  providedIn: 'root',
})
export class DynamicLoaderService {
  // This service is responsible for dynamically loading components from remote micro-frontends
  async loadRemoteComponent(remoteConfig: {
    remoteName: string;
    componentName: string;
    containerRef: ViewContainerRef;
    injector: Injector;
  }): Promise<ComponentRef<any> | null> {
    const { remoteName, componentName, containerRef, injector } = remoteConfig;
    try {
      if (!containerRef) {
        throw new Error('Container reference is required to load the component.');
      }
      const module = await loadRemote<{ [key: string]: any }>(
        remoteName + '/' + componentName,
        { loadFactory: true, from: 'runtime' }
      );

      if (!module) {
        throw new Error(`Module ${remoteName}/${componentName} not found.`);
      }

      const component = module[componentName];
      if (!component) {
        throw new Error(`Component ${componentName} not found in module ./${componentName}.`);
      }

      containerRef?.clear();
      const componentRef = createComponent(component, {
        environmentInjector: injector as EnvironmentInjector,
        elementInjector: injector,
      });

      containerRef?.insert(componentRef.hostView);
      return componentRef;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      return null;
    }
  }
  
  // This method is used to load components from local modules or libraries
  async loadComponent(componentConfig: {
    modulePath: string | null;
    componentName: string;
    containerRef: ViewContainerRef;
    injector: Injector;
  }): Promise<any | null> {
    const { modulePath, componentName, containerRef, injector } = componentConfig;
    try {
      let component: any;
      if (modulePath === null) {
        component = injector.get<any>(componentName as any);
      } else {
        const module = await import(modulePath);
        component = module[componentName];
      }

      containerRef.clear();

      const componentRef = createComponent(component, {
        environmentInjector: injector as EnvironmentInjector,
        elementInjector: injector,
      });
      containerRef.insert(componentRef.hostView);

      return componentRef;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      return null;
    }
  }
}
