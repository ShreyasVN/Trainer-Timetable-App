# Trainer Component Architecture

## Component Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Navigation                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   ViewContainer                             ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │                      View                               │││
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │││
│  │  │  │   Widget    │  │   Widget    │  │   Widget    │    │││
│  │  │  │             │  │             │  │             │    │││
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘    │││
│  │  │                                                       │││
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │││
│  │  │  │   Widget    │  │   Widget    │  │   Widget    │    │││
│  │  │  │             │  │             │  │             │    │││
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘    │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
components/trainer/
├── layout/
│   ├── Navigation.js
│   ├── ViewContainer.js
│   ├── MainLayout.js
│   └── index.js
├── views/
│   ├── TrainerDashboardView.js
│   ├── ScheduleView.js
│   ├── CalendarView.js
│   ├── SessionListView.js
│   └── index.js
├── widgets/
│   ├── StatsWidget.js
│   ├── ScheduleWidget.js
│   ├── CalendarWidget.js
│   ├── SessionCard.js
│   └── index.js
├── modals/
│   ├── CreateSessionModal.js
│   ├── EditSessionModal.js
│   ├── ConfirmationModal.js
│   └── index.js
├── hooks/
│   ├── useSession.js
│   ├── useSchedule.js
│   ├── useTrainerData.js
│   └── index.js
├── types/
│   ├── session.types.js
│   ├── schedule.types.js
│   ├── trainer.types.js
│   └── index.js
├── TrainerDashboard.js (existing)
└── index.js
```

## Component Responsibility Matrix

| Level | Component | Responsibilities |
|-------|-----------|------------------|
| **Navigation** | Top-level navigation | - App navigation<br>- Route handling<br>- User menu<br>- Breadcrumbs |
| **ViewContainer** | Layout wrapper | - Content layout<br>- Responsive design<br>- Scroll handling<br>- Loading states |
| **View** | Main content areas | - Data fetching<br>- State management<br>- Business logic<br>- Widget coordination |
| **Widgets** | Reusable components | - UI rendering<br>- User interactions<br>- Data display<br>- Form controls |

## Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Navigation  │───▶│ViewContainer│───▶│    View     │───▶│   Widgets   │
│             │    │             │    │             │    │             │
│ - Routes    │    │ - Layout    │    │ - State     │    │ - UI        │
│ - Auth      │    │ - Wrapper   │    │ - Logic     │    │ - Events    │
│ - Menu      │    │ - Loading   │    │ - Data      │    │ - Display   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Import Structure

With the barrel files, components can be imported cleanly:

```javascript
// Instead of:
import Navigation from './components/trainer/layout/Navigation';
import ViewContainer from './components/trainer/layout/ViewContainer';
import StatsWidget from './components/trainer/widgets/StatsWidget';

// Use:
import { Navigation, ViewContainer } from './components/trainer/layout';
import { StatsWidget } from './components/trainer/widgets';

// Or import everything from the main module:
import { Navigation, ViewContainer, StatsWidget } from './components/trainer';
```

## Component Examples

### Navigation Level
- **Navigation**: Main app navigation bar
- **NavigationMenu**: Dropdown menus
- **NavigationBreadcrumb**: Breadcrumb trail

### ViewContainer Level
- **ViewContainer**: Main layout wrapper
- **MainLayout**: Primary page layout
- **ContentWrapper**: Content area wrapper

### View Level
- **TrainerDashboardView**: Main dashboard view
- **ScheduleView**: Schedule management view
- **CalendarView**: Calendar display view
- **SessionListView**: Session list view

### Widgets Level
- **StatsWidget**: Statistics display
- **ScheduleWidget**: Schedule summary
- **CalendarWidget**: Mini calendar
- **SessionCard**: Individual session card
- **UtilizationChart**: Utilization charts

## Cross-Cutting Concerns

### Modals
Modals can be triggered from any level but are managed at the top level:
- Session creation/editing
- Confirmations
- Error dialogs

### Hooks
Custom hooks provide reusable logic across components:
- Data fetching
- State management
- Form handling
- Authentication

### Types
TypeScript types ensure type safety across all components:
- Component props
- API responses
- State shapes
- Event handlers

## Benefits of This Architecture

1. **Scalability**: Clear separation of concerns
2. **Maintainability**: Organized folder structure
3. **Reusability**: Widget-based architecture
4. **Testability**: Isolated components
5. **Developer Experience**: Clean imports with barrel files
6. **Performance**: Lazy loading possibilities
7. **Consistency**: Standardized component patterns
