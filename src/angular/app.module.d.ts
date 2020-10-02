import { InjectionToken, ModuleWithProviders } from '@angular/core';
import { SentryErrorHandler } from './error.handler';
import * as i0 from "@angular/core";
export interface SentryConfig {
    dsn: string;
}
export declare const SentryService: InjectionToken<SentryConfig>;
export declare class SentryModule {
    static forRoot(config: SentryConfig): ModuleWithProviders<SentryModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<SentryModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDef<SentryModule>;
}
export declare function provideSentryServiceOptions(config: SentryConfig): SentryErrorHandler;
