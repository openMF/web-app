# Error Handler Service

## Overview

The `ErrorHandlerService` is a centralized error-handling service for the Mifos X Web App. It provides consistent, user-friendly error messaging across the application by converting HTTP errors into meaningful messages and displaying them through Material Design snackbars.

## How It Works

### Trigger Mechanism

The `ErrorHandlerService` is **manually triggered** by components and services using RxJS's `catchError` operator. It works **alongside** (not replacing) the existing `ErrorHandlerInterceptor`:

#### Existing Interceptor (`error-handler.interceptor.ts`)

- Automatically intercepts **all** HTTP errors globally
- Shows generic error dialog for unhandled errors
- Cannot provide context-specific messages
- Located at: `src/app/core/http/error-handler.interceptor.ts`

#### ErrorHandlerService (This Service)

- **Manually invoked** per API call
- Provides **context-specific** error messages
- Displays user-friendly snackbar notifications
- Extracts Fineract-specific error details
- Gives developers fine-grained control

### When to Use

Use `ErrorHandlerService` when you need:

- Custom error messages for specific operations
- Context-aware error handling (e.g., "User not found", "Loan approval failed")
- Snackbar notifications instead of modal dialogs
- To extract and display Fineract API error messages

The interceptor still catches errors you don't explicitly handle, providing a safety net.

## Problem Solved

**Before:** The app handled API errors inconsistently:

- Some errors were shown directly from the server
- Others were not displayed clearly to users
- Error handling code was duplicated across components
- Poor user experience with technical error messages

**After:** Centralized error handling with:

- Consistent error messaging
- User-friendly error descriptions
- Reusable service across all components
- Better UX with appropriate snackbar notifications

## Features

### 1. HTTP Error Handling

- Automatically converts HTTP status codes into user-friendly messages
- Extracts Fineract-specific error messages
- Handles network/connection errors
- Supports contextual error messages

### 2. Supported Error Codes

| Status Code   | Title               | Behavior                |
| ------------- | ------------------- | ----------------------- |
| 400           | Invalid Request     | Shows validation errors |
| 401           | Unauthorized        | Session expired message |
| 403           | Access Denied       | Permission error        |
| 404           | Not Found           | Resource not found      |
| 409           | Conflict            | Duplicate resource      |
| 500           | Server Error        | Generic server error    |
| 503           | Service Unavailable | Service down message    |
| Network Error | Connection Error    | Connection issues       |

### 3. Notification Types

- **Error Notifications**: Red snackbar, top-center, 5 seconds
- **Success Notifications**: Green snackbar, bottom-center, 3 seconds
- **Info Notifications**: Blue snackbar, bottom-center, 4 seconds

## Usage

### Basic Error Handling

```typescript
import { ErrorHandlerService } from '@core/error-handler/error-handler.service';
import { catchError } from 'rxjs/operators';

export class MyComponent {
  constructor(private errorHandler: ErrorHandlerService) {}

  loadData() {
    this.dataService
      .getData()
      .pipe(catchError((error) => this.errorHandler.handleError(error)))
      .subscribe((data) => {
        // Handle success
      });
  }
}
```

### Error Handling with Context

```typescript
loadUser(userId: string) {
  this.userService.getUser(userId).pipe(
    catchError(error => this.errorHandler.handleError(error, 'User'))
  ).subscribe(user => {
    // Handle success
  });
}
// Shows: "Not Found: User not found." for 404 errors
```

### Success Messages

```typescript
saveData() {
  this.dataService.save(data).subscribe(
    response => {
      this.errorHandler.showSuccess('Data saved successfully!');
    },
    error => {
      this.errorHandler.handleError(error);
    }
  );
}
```

### Info Messages

```typescript
loadData() {
  this.errorHandler.showInfo('Loading data, please wait...');
  this.dataService.getData().subscribe(/* ... */);
}
```

## Advanced Usage

### Custom Error Handling

```typescript
import { HttpErrorResponse } from '@angular/common/http';

processData() {
  this.dataService.process().subscribe(
    response => {
      this.errorHandler.showSuccess('Processing complete!');
    },
    (error: HttpErrorResponse) => {
      if (error.status === 409) {
        // Custom handling for conflicts
        this.handleConflict(error);
      } else {
        this.errorHandler.handleError(error, 'Data processing');
      }
    }
  );
}
```

### Integration with Form Validation

```typescript
submitForm() {
  if (this.form.invalid) {
    this.errorHandler.showInfo('Please fill all required fields');
    return;
  }

  this.formService.submit(this.form.value).pipe(
    catchError(error => this.errorHandler.handleError(error, 'Form submission'))
  ).subscribe(response => {
    this.errorHandler.showSuccess('Form submitted successfully!');
  });
}
```

## Styling

The service uses three CSS classes defined in `error-handler.component.scss`:

```scss
.error-snackbar   // Red background (#f44336) for errors
.success-snackbar // Green background (#4caf50) for success
.info-snackbar    // Blue background (#2196f3) for info
```

These styles are automatically applied based on the notification type. The styles are imported globally in `main.scss` so they work across the entire application.

## API Reference

### Methods

#### `handleError(error: HttpErrorResponse, context?: string): Observable<never>`

Handles HTTP errors and shows user-friendly messages.

**Parameters:**

- `error`: The HTTP error response
- `context` (optional): Additional context for more specific messages

**Returns:** Observable that throws the original error

**Example:**

```typescript
this.errorHandler.handleError(error, 'Client');
```

---

#### `showSuccess(message: string, action?: string): void`

Shows a success message to the user.

**Parameters:**

- `message`: The success message to display
- `action` (optional): Button text (defaults to 'OK')

**Example:**

```typescript
this.errorHandler.showSuccess('Client created successfully!', 'View');
```

---

#### `showInfo(message: string, action?: string): void`

Shows an informational message to the user.

**Parameters:**

- `message`: The info message to display
- `action` (optional): Button text (defaults to 'OK')

**Example:**

```typescript
this.errorHandler.showInfo('Loading data...', 'Dismiss');
```

## Fineract Integration

The service automatically extracts Fineract-specific error messages:

```typescript
// Fineract error structure
{
  "errors": [{
    "defaultUserMessage": "Client with same name already exists"
  }],
  "defaultUserMessage": "Validation error"
}
```

The service prioritizes:

1. `errors[0].defaultUserMessage`
2. `defaultUserMessage`
3. Generic fallback message

## Migration Guide

### Before (Old Approach)

```typescript
// Inconsistent error handling
this.clientService.getClient(id).subscribe(
  (data) => {
    /* success */
  },
  (error) => {
    console.error(error);
    alert('Error loading client'); // Poor UX
  }
);
```

### After (Centralized Approach)

```typescript
// Consistent error handling
this.clientService
  .getClient(id)
  .pipe(catchError((error) => this.errorHandler.handleError(error, 'Client')))
  .subscribe((data) => {
    // Handle success
  });
```

## Best Practices

1. **Always provide context** for better error messages:

   ```typescript
   catchError((error) => this.errorHandler.handleError(error, 'Loan Application'));
   ```

2. **Use appropriate notification types**:
   - Errors: Use `handleError()` for API failures
   - Success: Use `showSuccess()` for successful operations
   - Info: Use `showInfo()` for informational messages

3. **Don't duplicate error handling**: Let the service handle standard errors

4. **Custom handling when needed**: Handle specific error cases before using the service

5. **Combine with loading states**:
   ```typescript
   this.isLoading = true;
   this.service
     .getData()
     .pipe(
       finalize(() => (this.isLoading = false)),
       catchError((error) => this.errorHandler.handleError(error))
     )
     .subscribe();
   ```

## Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }]
    });

    service = TestBed.inject(ErrorHandlerService);
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should show success message', () => {
    service.showSuccess('Test success');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test success',
      'OK',
      jasmine.objectContaining({
        panelClass: ['success-snackbar']
      })
    );
  });
});
```

## Related Issues

- **WEB-429**: Implement centralized error handler service for user-friendly API error messaging

## Contributing

When modifying this service:

1. Ensure all HTTP status codes are handled appropriately
2. Update the documentation with new features
3. Maintain consistent snackbar positioning and duration
4. Test with actual Fineract API responses
5. Follow Angular and TypeScript best practices

## License

Licensed under the Apache License, Version 2.0. See the LICENSE file for details.
