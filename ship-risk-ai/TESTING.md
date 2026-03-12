# Testing Guide

This project uses **Vitest** for unit and integration testing, along with **React Testing Library** for component testing.

## Installing Dependencies

```bash
npm install
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm test -- --watch
```

### Run tests with UI

```bash
npm run test:ui
```

### Generate coverage report

```bash
npm run coverage
```

## Test Structure

Tests are colocated with their source files using the `.test.ts` or `.test.tsx` extension:

```
src/
  components/
    Risk/
      RiskTier.tsx
      RiskTier.test.tsx  <- Test file
  utils/
    formatters.ts
    formatters.test.ts   <- Test file
  services/
    exportService.ts
    exportService.test.ts <- Test file
```

## Writing Tests

### Component Tests Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Utility Tests Example

```typescript
import { describe, it, expect } from "vitest";
import { myUtility } from "./myUtility";

describe("myUtility", () => {
  it("should transform input correctly", () => {
    expect(myUtility("input")).toBe("expected");
  });
});
```

## Test Coverage

Current test coverage targets:

- Utilities: 80%+
- Components: 70%+
- Services: 75%+

Generate and view coverage:

```bash
npm run coverage
```

## Useful Links

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
