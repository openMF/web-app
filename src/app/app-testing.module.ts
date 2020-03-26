/** Angular Modules */
import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/** Custom Modules */
import { SharedModule } from './shared/shared.module';
import { PipesModule } from './pipes/pipes.module';

/**
 * App Testing Module
 *
 * Modules that are useful in executing tests throughout the application should be here.
 */
@NgModule({
  exports: [
    RouterTestingModule,
    HttpClientTestingModule,
    BrowserAnimationsModule,
    PipesModule,
    SharedModule
  ]
})
export class AppTestingModule { }
