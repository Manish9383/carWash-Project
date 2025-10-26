import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting, ServerRoute, RenderMode } from '@angular/ssr';
import { appConfig } from './app.config';

// ✅ Define server-specific routes (ServerRoute[])
export const serverRoutes: ServerRoute[] = [
  { 
    path: '', 
    renderMode: RenderMode.Server  //  Server-side rendering enabled
  }
];

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes)  //  Only server-related routing here
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
