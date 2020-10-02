import { BreadCrumb, ExceptionOptions, MessageOptions, SentryUser } from './';
export declare class Sentry {
    static init(dsn: string): void;
    static captureMessage(message: string, options?: MessageOptions): void;
    static captureException(exception: Error, options?: ExceptionOptions): void;
    static captureBreadcrumb(breadcrumb: BreadCrumb): void;
    static setContextUser(user: SentryUser): void;
    static setContextTags(tags: any): void;
    static setContextExtra(extra: object): void;
    static clearContext(): void;
    private static _convertSentryLevel;
    private static _convertDataTypeToString;
}
export declare enum Level {
    Fatal = "fatal",
    Error = "error",
    Warning = "warning",
    Info = "info",
    Debug = "debug"
}
