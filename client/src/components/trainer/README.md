# Trainer Component Module

## Overview

This directory contains all components related to the trainer functionality. The architecture follows a hierarchical structure that promotes maintainability, scalability, and clean code organization.

## Quick Start

```javascript
// Import individual components
import { Navigation, ViewContainer } from './components/trainer/layout';
import { StatsWidget } from './components/trainer/widgets';
import { useSession } from './components/trainer/hooks';

// Or import from the main module
import { 
  Navigation, 
  ViewContainer, 
  StatsWidget, 
  useSession 
} from './components/trainer';
```

## Architecture

### Component Hierarchy
```
Navigation ➔ ViewContainer ➔ View ➔ Widgets
```

### Directory Structure
- **`layout/`** - Navigation and layout components
- **`views/`** - Main content views and pages
- **`widgets/`** - Reusable UI components
- **`modals/`** - Dialog and modal components
- **`hooks/`** - Custom React hooks
- **`types/`** - TypeScript type definitions

## Key Files

- **`index.js`** - Main barrel file for the trainer module
- **`ARCHITECTURE.md`** - Detailed architecture documentation
- **`TrainerDashboard.js`** - Existing main dashboard component

## Component Organization

### Layout Components (`layout/`)
Handle application structure and navigation:
- Navigation bars
- View containers
- Layout wrappers
- Responsive containers

### View Components (`views/`)
Main content areas containing business logic:
- Dashboard views
- Schedule views
- Calendar views
- Profile views

### Widget Components (`widgets/`)
Reusable UI elements:
- Statistics widgets
- Charts and graphs
- Form controls
- Data displays

### Modal Components (`modals/`)
Overlay dialogs and popups:
- Session creation/editing
- Confirmation dialogs
- Error messages
- Settings panels

### Custom Hooks (`hooks/`)
Reusable React logic:
- Data fetching
- State management
- Form handling
- Authentication

### Type Definitions (`types/`)
TypeScript types and interfaces:
- Component props
- API responses
- State shapes
- Event handlers

## Best Practices

1. **Use Barrel Files**: Import from `index.js` files for cleaner imports
2. **Follow Hierarchy**: Components should respect the architectural layers
3. **Separate Concerns**: Keep layout, business logic, and UI separate
4. **Reuse Widgets**: Build reusable components in the widgets folder
5. **Type Safety**: Use TypeScript types from the types folder
6. **Custom Hooks**: Extract reusable logic into custom hooks

## Development Guidelines

### Adding New Components

1. **Identify the correct folder** based on the component's responsibility
2. **Create the component** following existing patterns
3. **Export from the folder's index.js** for clean imports
4. **Add types** if using TypeScript
5. **Update documentation** if needed

### Import Strategy

```javascript
// ✅ Good - Use barrel files
import { Component } from './components/trainer/widgets';

// ❌ Avoid - Direct file imports
import Component from './components/trainer/widgets/Component';
```

### File Naming

- Use PascalCase for component files: `SessionCard.js`
- Use camelCase for utility files: `sessionUtils.js`
- Use kebab-case for type files: `session-types.js`

## Integration

This component architecture integrates with:
- React Router for navigation
- Redux/Context for state management
- API services for data fetching
- Testing frameworks for component testing

## Next Steps

1. Create specific components within each folder
2. Implement the component hierarchy
3. Add proper TypeScript types
4. Create unit tests for components
5. Add Storybook stories for documentation

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).
