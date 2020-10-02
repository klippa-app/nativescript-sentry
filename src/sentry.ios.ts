import { BreadCrumb, ExceptionOptions, MessageOptions, SentryUser } from './';

export class Sentry {
  public static init(dsn: string) {
    SentryClient.sharedClient = SentryClient.alloc().initWithDsnDidFailWithError(dsn);
    SentryClient.sharedClient.startCrashHandlerWithError();
    SentryClient.sharedClient.enableAutomaticBreadcrumbTracking();
  }

  public static captureMessage(message: string, options?: MessageOptions) {
    const level = options && options.level ? options.level : null;

    const event = SentryEvent.alloc().initWithLevel(this._convertSentryLevel(level));
    event.message = message;

    // Set extras
    if (options && options.extra) {
      // create NSDictionary<string, any> for the object provided
      const dict = NSDictionary.new<string, any>();
      Object.keys(options.extra).forEach(key => {
        const nativeDataValue = Sentry._convertDataTypeToString(options.extra[key]);
        dict.setValueForKey(nativeDataValue, key);
      });

      event.extra = dict;
    }

    if (options && options.tags) {
      event.tags = NSDictionary.dictionaryWithDictionary(options.tags as NSDictionary<string, string>);
    }
    SentryClient.sharedClient.sendEventWithCompletionHandler(event, () => {
      // nothing here
    });
  }

  public static captureException(exception: Error, options?: ExceptionOptions) {
    const event = SentryEvent.alloc().initWithLevel(SentrySeverity.kSentrySeverityError);

    // create a string of the entire Error for sentry to display as much info as possible
    event.message = JSON.stringify({
      message: exception.message,
      stacktrace: exception.stack,
      name: exception.name
    });

    // Set extras
    if (options && options.extra) {
      // create NSDictionary<string, any> for the object provided
      const dict = NSDictionary.new<string, any>();
      Object.keys(options.extra).forEach(key => {
        const nativeDataValue = Sentry._convertDataTypeToString(options.extra[key]);
        dict.setValueForKey(nativeDataValue, key);
      });

      event.extra = dict;
    }

    if (options && options.tags) {
      event.tags = NSDictionary.dictionaryWithDictionary(options.tags as NSDictionary<string, string>);
    }

    SentryClient.sharedClient.sendEventWithCompletionHandler(event, () => {
      // nothing here
    });
  }

  public static captureBreadcrumb(breadcrumb: BreadCrumb) {
    // create the iOS SentryBreadCrumb
    const sentryBC = SentryBreadcrumb.alloc().initWithLevelCategory(
      this._convertSentryLevel(breadcrumb.level),
      breadcrumb.category
    );
    sentryBC.message = breadcrumb.message;
    SentryClient.sharedClient.breadcrumbs.addBreadcrumb(sentryBC);
  }

  public static setContextUser(user: SentryUser) {
    const userNative = SentryUser.alloc().initWithUserId(user.id);
    userNative.email = user.email ? user.email : '';
    userNative.username = user.username ? user.username : '';
    if (user.data) {
      // create NSDictionary<string, any> for the object provided
      const dict = NSDictionary.new<string, any>();
      Object.keys(user.data).forEach(key => {
        const nativeDataValue = Sentry._convertDataTypeToString(user.data[key]);
        dict.setValueForKey(nativeDataValue, key);
      });

      userNative.extra = dict;
    }
    SentryClient.sharedClient.user = userNative;
  }

  public static setContextTags(tags: any) {
    SentryClient.sharedClient.tags = NSDictionary.dictionaryWithDictionary(tags as NSDictionary<string, string>);
  }
  public static setContextExtra(extra: object) {
    // create NSDictionary<string, any> for the object provided
    const dict = NSDictionary.new<string, any>();
    Object.keys(extra).forEach(key => {
      // adding type check to not force toString on the extra
      const nativeDataValue = Sentry._convertDataTypeToString(extra[key]);
      dict.setValueForKey(nativeDataValue, key);
    });
    SentryClient.sharedClient.extra = dict;
  }

  public static clearContext() {
    SentryClient.sharedClient.clearContext();
  }

  /**
   * Returns the ios Sentry Level for the provided TNS_SentryLevel
   * @default - INFO
   */
  private static _convertSentryLevel(level: Level) {
    if (!level) {
      return SentrySeverity.kSentrySeverityInfo;
    }

    switch (level) {
      case Level.Info:
        return SentrySeverity.kSentrySeverityInfo;
      case Level.Warning:
        return SentrySeverity.kSentrySeverityWarning;
      case Level.Fatal:
        return SentrySeverity.kSentrySeverityFatal;
      case Level.Error:
        return SentrySeverity.kSentrySeverityError;
      case Level.Debug:
        return SentrySeverity.kSentrySeverityDebug;
      default:
        return SentrySeverity.kSentrySeverityInfo;
    }
  }

  /**
   * Takes the provided value and checks for boolean, number or object and converts it to string.
   * @param value
   */
  private static _convertDataTypeToString(value: any): string {
    if (value === undefined || value === null) {
      return 'null';
    }

    switch (typeof value) {
      case 'object':
        if (value instanceof Date) {
          return value.toISOString();
        }

        if (Array.isArray(value)) {
          const list = [];
          value.forEach(data => {
            list.push(this._convertDataTypeToString(data));
          });
          return JSON.stringify(list, null, 2);
        }

        const object = {};
        Object.keys(value).forEach(itemKey => {
          object[itemKey] = this._convertDataTypeToString(value[itemKey]);
        });

        return JSON.stringify(object, null, 2);
      case 'number':
        return value.toString();
      case 'boolean':
        return value ? 'true' : 'false';
    }

    return value;
  }
}

export enum Level {
  Fatal = 'fatal',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Debug = 'debug'
}
