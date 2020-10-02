import { BreadCrumb, ExceptionOptions, MessageOptions, SentryUser } from './';

export class Sentry {
  /**
   * @deprecated - Set your public DSN in your app's AndroidManifest file.
   * @link https://github.com/FinanzRitter/nativescript-sentry#android for more information
   * @param dsn
   */
  public static init(dsn: string) {
    // Starting with sentry-android 2.0.0 the init method of Sentry does not work out of the box
    // with NativeScript. This is because it is not possible to call a Java/Kotlin Lambda function
    // from NativeScript.
    // Instead configure the DSN and further config in your AndroidManifest.xml.
    // Add <meta-data android:name="io.sentry.dsn" android:value="__YOUR_DSN_HERE__" /> within the
    // application tag.
  }

  public static captureMessage(message: string, options?: MessageOptions) {
    // Create event
    const event = new io.sentry.core.SentryEvent();

    // Set level
    const level = options && options.level ? options.level : null;
    event.setLevel(this._convertSentryEventLevel(level));

    // Set message
    const msg = new io.sentry.core.protocol.Message();
    msg.setMessage(message);
    event.setMessage(msg);

    // Set extras
    if (options && options.extra) {
      Object.keys(options.extra).forEach(key => {
        const nativeDataValue = Sentry._convertDataTypeToString(options.extra[key]);
        event.setExtra(key, nativeDataValue);
      });
    }

    // Set tags
    if (options && options.tags) {
      // tags are required as strings
      Object.keys(options.tags).forEach(key => {
        event.setTag(key, options.tags[key].toString());
      });
    }

    // Send event
    io.sentry.core.Sentry.captureEvent(event);
  }

  public static captureException(exception: Error, options?: ExceptionOptions) {
    // TODO: attach tags and extra directly on the exeption
    if (options && options.extra) {
      this.setContextExtra(options.extra);
    }

    if (options && options.tags) {
      this.setContextTags(options.tags);
    }

    const cause = new java.lang.Throwable(exception.stack);

    // creating a new Exception to send to Sentry which will include the
    // JS Error stacktrace as the "cause" and the JS Error message as the Throwable "message"
    // https://developer.android.com/reference/java/lang/Exception.html#Exception(java.lang.String,%20java.lang.Throwable)
    const ex = new java.lang.Exception(exception.message, cause);
    io.sentry.core.Sentry.captureException(ex);
  }

  public static captureBreadcrumb(breadcrumb: BreadCrumb) {
    // Create BreadCrumb
    const nativeBreadCrumb = new io.sentry.core.Breadcrumb();
    nativeBreadCrumb.setLevel(this._convertSentryEventLevel(breadcrumb.level));
    nativeBreadCrumb.setCategory(breadcrumb.category);
    nativeBreadCrumb.setMessage(breadcrumb.message);

    // Add BreadCrumb
    io.sentry.core.Sentry.addBreadcrumb(nativeBreadCrumb);
  }

  public static setContextUser(user: SentryUser) {
    // handle the data object if provided
    let nativeMapObject: java.util.HashMap<any, any>;
    if (user.data) {
      nativeMapObject = new java.util.HashMap<any, any>();
      Object.keys(user.data).forEach(key => {
        const nativeDataValue = Sentry._convertDataTypeToString(user.data[key]);
        nativeMapObject.put(key, nativeDataValue);
      });
    }

    const nativeUser = new io.sentry.core.protocol.User();
    nativeUser.setId(user.id);
    nativeUser.setEmail(user.email ? user.email : '');
    nativeUser.setUsername(user.username ? user.username : '');
    if (nativeMapObject) {
      nativeUser.setOthers(nativeMapObject);
    }
    io.sentry.core.Sentry.setUser(nativeUser);
  }

  public static setContextTags(tags: object) {
    Object.keys(tags).forEach(key => {
      io.sentry.core.Sentry.setTag(key, tags[key].toString());
    });
  }

  public static setContextExtra(extra: object) {
    Object.keys(extra).forEach(key => {
      // adding type check to not force toString on the extra
      const nativeDataValue = Sentry._convertDataTypeToString(extra[key]);
      io.sentry.core.Sentry.setExtra(key, nativeDataValue);
    });
  }

  public static clearContext() {
    // Nothing to do here?
  }

  /**
   * Returns the android Sentry Level for the provided TNS_SentryLevel
   * @default - INFO
   */
  private static _convertSentryEventLevel(level: Level) {
    if (!level) {
      return io.sentry.core.SentryLevel.INFO;
    }

    switch (level) {
      case Level.Info:
        return io.sentry.core.SentryLevel.INFO;
      case Level.Warning:
        return io.sentry.core.SentryLevel.WARNING;
      case Level.Fatal:
        return io.sentry.core.SentryLevel.FATAL;
      case Level.Error:
        return io.sentry.core.SentryLevel.ERROR;
      case Level.Debug:
        return io.sentry.core.SentryLevel.DEBUG;
      default:
        return io.sentry.core.SentryLevel.INFO;
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
