import { ErrorHandler } from '@angular/core';
import * as i0 from "@angular/core";
export declare class SentryErrorHandler extends ErrorHandler {
    private config;
    private _discardUncaughtJsExceptions;
    constructor(config: any);
    handleError(err: any): void;
    private _setDSN;
    private _setDiscardUncaughtJsExceptions;
    static ɵfac: i0.ɵɵFactoryDef<SentryErrorHandler, never>;
    static ɵprov: i0.ɵɵInjectableDef<SentryErrorHandler>;
}
