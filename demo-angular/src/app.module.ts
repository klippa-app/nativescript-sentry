import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from '@nativescript/angular';
import { SentryModule } from 'nativescript-sentry/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    SentryModule.forRoot({
      dsn: '__YOUR_DSN_HERE__'
    })
  ],
  declarations: [AppComponent, HomeComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {}
