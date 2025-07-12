# Trainer Timetable Design System

A comprehensive design system serving as the single source of truth for all UI components, patterns, and guidelines used throughout the Trainer Timetable application.

## 🎨 Design Principles

### 1. **Consistency**
- Unified visual language across all platforms
- Consistent component behavior and interactions
- Standardized spacing, typography, and colors

### 2. **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios of 4.5:1 or higher

### 3. **Scalability**
- Modular component architecture
- Responsive design patterns
- Platform-agnostic tokens
- Mobile-first approach

### 4. **Usability**
- Intuitive user interfaces
- Clear information hierarchy
- Efficient task completion flows
- Error prevention and recovery

## 🎯 Core Components

### Layout System
- **Grid System**: 12-column responsive grid
- **Container**: Max-width containers with responsive breakpoints
- **Spacing**: 8px base unit with consistent spacing scale
- **Breakpoints**: Mobile (375px), Tablet (768px), Desktop (1200px), Large Desktop (1440px)

### Typography
- **Primary Font**: Poppins (headings, UI elements)
- **Secondary Font**: Inter (body text, forms)
- **Mono Font**: Fira Code (code, data display)
- **Scale**: 9 font sizes from 12px to 128px
- **Weights**: 9 weights from thin (100) to black (900)

### Color System
- **Primary**: Blue scale (50-900) - Main brand, primary actions
- **Secondary**: Purple scale (50-900) - Accents, secondary actions
- **Semantic**: Success (green), Error (red), Warning (amber), Info (cyan)
- **Neutral**: Gray scale (50-900) - Text, borders, backgrounds
- **Theme Support**: Light and dark mode variants

### Components
- **Buttons**: Primary, Secondary, Outline, Text, Icon
- **Forms**: Input, Select, Textarea, Checkbox, Radio, Switch
- **Navigation**: Header, Sidebar, Breadcrumb, Pagination
- **Data Display**: Card, Table, List, Badge, Avatar
- **Feedback**: Alert, Toast, Modal, Tooltip, Progress
- **Layout**: Container, Stack, Grid, Divider

## 📱 Platform-Specific Guidelines

### Dashboard (Desktop)
- **Layout**: Sidebar navigation with main content area
- **Density**: Compact information display
- **Interactions**: Hover states, keyboard shortcuts
- **Components**: Data tables, charts, cards, modals

### Forms
- **Layout**: Single-column with clear sections
- **Validation**: Real-time validation with clear error messages
- **Accessibility**: Proper labels, error announcements
- **Progressive Disclosure**: Multi-step forms with progress indicators

### Calendar
- **Views**: Month, Week, Day, List views
- **Interactions**: Drag & drop, click to create/edit
- **Responsive**: Stack views on mobile
- **Accessibility**: Keyboard navigation, screen reader support

### Mobile
- **Navigation**: Bottom tab bar with gesture support
- **Touch Targets**: Minimum 44px touch targets
- **Gestures**: Swipe, pinch, long press
- **Responsive**: Fluid layouts with breakpoint-specific optimizations

## 🔧 Implementation

### CSS Custom Properties
All design tokens are implemented as CSS custom properties with automatic dark mode support:

```css
:root {
  --primary-500: #0ea5e9;
  --text-primary: #0f172a;
  --spacing-4: 1rem;
  --radius-lg: 0.5rem;
}

[data-theme="dark"] {
  --primary-500: #38bdf8;
  --text-primary: #f8fafc;
}
```

### React Components
All components are built with React and support:
- TypeScript (optional)
- Theme switching
- Accessibility features
- Responsive design
- Storybook documentation

### Tailwind CSS Integration
Design tokens are integrated with Tailwind CSS for utility classes:
- Custom color palette
- Extended spacing scale
- Animation utilities
- Responsive variants

## 📖 Usage Guidelines

### Do's
- ✅ Use semantic HTML elements
- ✅ Implement proper ARIA labels
- ✅ Follow spacing guidelines
- ✅ Use consistent naming conventions
- ✅ Test on multiple devices and browsers

### Don'ts
- ❌ Hard-code colors or spacing values
- ❌ Create custom components without consulting design system
- ❌ Ignore accessibility guidelines
- ❌ Use inconsistent interaction patterns
- ❌ Override design tokens without justification

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Storybook**
   ```bash
   npm run storybook
   ```

3. **Import Components**
   ```javascript
   import { Button, Input, Card } from '../components/ui';
   ```

4. **Use Design Tokens**
   ```css
   .custom-component {
     padding: var(--spacing-4);
     color: var(--text-primary);
     border-radius: var(--radius-lg);
   }
   ```

## 📚 Documentation

- **Storybook**: Interactive component documentation
- **Figma**: Design specifications and prototypes
- **GitHub**: Implementation guidelines and examples
- **Confluence**: UX flows and design decisions

## 🔄 Versioning

The design system follows semantic versioning:
- **Major**: Breaking changes to existing components
- **Minor**: New components or non-breaking enhancements
- **Patch**: Bug fixes and minor improvements

## 🤝 Contributing

1. Review design system guidelines
2. Create components following established patterns
3. Add Storybook stories for documentation
4. Test accessibility compliance
5. Submit pull request with detailed description

## 📞 Support

For questions or support:
- **Design**: Contact design team
- **Development**: Create GitHub issue
- **Documentation**: Update this README

---

*This design system is a living document that evolves with the product. Regular updates ensure consistency and quality across all touchpoints.*
