# Frontend Development Guidelines

## Overview

This document provides comprehensive development guidelines for the BLIH System frontend, built with Next.js 16 and following modern React best practices.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Component Development](#component-development)
6. [State Management](#state-management)
7. [Styling Guidelines](#styling-guidelines)
8. [Performance Optimization](#performance-optimization)
9. [Testing Guidelines](#testing-guidelines)
10. [Accessibility Guidelines](#accessibility-guidelines)
11. [Security Guidelines](#security-guidelines)
12. [Deployment Guidelines](#deployment-guidelines)

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules with PostCSS
- **Package Manager**: npm
- **Build Tool**: Turborepo
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript with strict mode

### Core Principles

- **Component-First Architecture**: Reusable, composable components
- **Type Safety**: Full TypeScript coverage
- **Performance-First**: Optimized for Core Web Vitals
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile-First**: Responsive design approach

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 10.9.2
- Modern web browser with developer tools

### Initial Setup

1. **Install Dependencies**

   ```bash
   cd apps/web
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Commands

```bash
# Development
npm run dev                 # Start development server on port 3000
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run check-types        # Run TypeScript type checking

# Testing (when configured)
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── fonts/             # Local font files
│   └── ...                # Other pages and layouts
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── utils/            # Helper functions
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   └── constants/        # Application constants
├── types/                # TypeScript type definitions
├── styles/               # Global styles and themes
├── public/               # Static assets
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── eslint.config.js      # ESLint configuration
```

### Recommended Directory Structure

```
components/
├── ui/                    # Base UI components (buttons, inputs, etc.)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Card/
│   └── index.ts
├── layout/               # Layout components
│   ├── Header/
│   ├── Sidebar/
│   └── Footer/
├── features/             # Feature-specific components
│   ├── auth/
│   ├── dashboard/
│   └── users/
└── index.ts              # Barrel exports
```

## Coding Standards

### TypeScript Guidelines

1. **Strict Configuration**

   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true
     }
   }
   ```

2. **Type Definitions**

   ```typescript
   // types/index.ts
   export interface User {
     id: string;
     name: string;
     email: string;
     role: UserRole;
     createdAt: Date;
     updatedAt: Date;
   }

   export type UserRole = 'admin' | 'user' | 'guest';

   export interface ApiResponse<T> {
     data: T;
     success: boolean;
     message?: string;
   }
   ```

3. **Component Props Typing**

   ```typescript
   // components/ui/Button/Button.tsx
   interface ButtonProps {
     children: React.ReactNode;
     variant?: 'primary' | 'secondary' | 'danger';
     size?: 'sm' | 'md' | 'lg';
     disabled?: boolean;
     onClick?: () => void;
     className?: string;
   }

   export const Button: React.FC<ButtonProps> = ({
     children,
     variant = 'primary',
     size = 'md',
     disabled = false,
     onClick,
     className,
   }) => {
     // Component implementation
   };
   ```

### React Best Practices

1. **Functional Components with Hooks**

   ```typescript
   // Use functional components with hooks
   export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       fetchUser(userId).then(userData => {
         setUser(userData);
         setLoading(false);
       });
     }, [userId]);

     if (loading) return <div>Loading...</div>;
     if (!user) return <div>User not found</div>;

     return <div>{user.name}</div>;
   };
   ```

2. **Custom Hooks**

   ```typescript
   // lib/hooks/useApi.ts
   export function useApi<T>(url: string, options?: RequestInit) {
     const [data, setData] = useState<T | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       fetch(url, options)
         .then((response) => {
           if (!response.ok) throw new Error(response.statusText);
           return response.json();
         })
         .then(setData)
         .catch(setError)
         .finally(() => setLoading(false));
     }, [url, options]);

     return { data, loading, error };
   }
   ```

### Code Organization

1. **Import Order**

   ```typescript
   // 1. React and Next.js imports
   import React, { useState, useEffect } from 'react';
   import Image from 'next/image';

   // 2. Third-party libraries
   import axios from 'axios';

   // 3. Internal imports (types, utils, components)
   import { User } from '@/types';
   import { formatDate } from '@/lib/utils';
   import { Button } from '@/components/ui';

   // 4. Relative imports
   import styles from './UserProfile.module.css';
   ```

2. **Component Structure**

   ```typescript
   // 1. Imports
   import React, { useState, useEffect } from 'react';
   import styles from './Component.module.css';

   // 2. Types/Interfaces
   interface ComponentProps {
     // Props definition
   }

   // 3. Component definition
   export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
     // 4. Hooks
     const [state, setState] = useState();

     // 5. Event handlers
     const handleClick = () => {
       // Handler logic
     };

     // 6. Effects
     useEffect(() => {
       // Effect logic
     }, []);

     // 7. Conditional rendering
     if (!condition) {
       return <div>Loading...</div>;
     }

     // 8. Main render
     return (
       <div className={styles.container}>
         {/* JSX content */}
       </div>
     );
   };
   ```

## Component Development

### Component Guidelines

1. **Single Responsibility Principle**

   ```typescript
   // Good: Focused component
   export const UserAvatar: React.FC<{ user: User; size?: number }> = ({
     user,
     size = 40,
   }) => {
     return (
       <Image
         src={user.avatar}
         alt={user.name}
         width={size}
         height={size}
         className={styles.avatar}
       />
     );
   };

   // Bad: Component doing too much
   export const UserCard: React.FC<{ user: User }> = ({ user }) => {
     // Handles avatar, profile info, actions, etc. - too much responsibility
   };
   ```

2. **Composition over Inheritance**

   ```typescript
   // Compose smaller components
   export const UserCard: React.FC<{ user: User }> = ({ user }) => {
     return (
       <Card>
         <UserAvatar user={user} size={60} />
         <UserInfo user={user} />
         <UserActions user={user} />
       </Card>
     );
   };
   ```

3. **Props Interface Design**

   ```typescript
   interface ButtonProps {
     // Required props first
     children: React.ReactNode;
     onClick: () => void;

     // Optional props with defaults
     variant?: 'primary' | 'secondary';
     size?: 'sm' | 'md' | 'lg';
     disabled?: boolean;

     // Spread props for HTML attributes
     [key: string]: any;
   }
   ```

### Component Patterns

1. **Compound Components**

   ```typescript
   // components/ui/Tabs/Tabs.tsx
   interface TabsContextValue {
     activeTab: string;
     setActiveTab: (tab: string) => void;
   }

   const TabsContext = React.createContext<TabsContextValue | null>(null);

   export const Tabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [activeTab, setActiveTab] = useState('tab1');

     return (
       <TabsContext.Provider value={{ activeTab, setActiveTab }}>
         <div className={styles.tabs}>{children}</div>
       </TabsContext.Provider>
     );
   };

   export const Tab: React.FC<{ id: string; children: React.ReactNode }> = ({
     id,
     children
   }) => {
     const context = useContext(TabsContext);
     if (!context) throw new Error('Tab must be used within Tabs');

     const isActive = context.activeTab === id;

     return (
       <button
         className={`${styles.tab} ${isActive ? styles.active : ''}`}
         onClick={() => context.setActiveTab(id)}
       >
         {children}
       </button>
     );
   };
   ```

2. **Render Props Pattern**

   ```typescript
   export const DataFetcher: React.FC<{
     url: string;
     children: (data: any, loading: boolean, error: string | null) => React.ReactNode;
   }> = ({ url, children }) => {
     const { data, loading, error } = useApi(url);

     return <>{children(data, loading, error)}</>;
   };

   // Usage
   <DataFetcher url="/api/users">
     {(data, loading, error) => {
       if (loading) return <div>Loading...</div>;
       if (error) return <div>Error: {error}</div>;
       return <UserList users={data} />;
     }}
   </DataFetcher>
   ```

## State Management

### Local State Management

1. **useState for Simple State**

   ```typescript
   export const Counter: React.FC = () => {
     const [count, setCount] = useState(0);

     return (
       <div>
         <p>Count: {count}</p>
         <button onClick={() => setCount(count + 1)}>Increment</button>
       </div>
     );
   };
   ```

2. **useReducer for Complex State**

   ```typescript
   type State = {
     users: User[];
     loading: boolean;
     error: string | null;
     filters: UserFilters;
   };

   type Action =
     | { type: 'FETCH_START' }
     | { type: 'FETCH_SUCCESS'; payload: User[] }
     | { type: 'FETCH_ERROR'; payload: string }
     | { type: 'SET_FILTERS'; payload: UserFilters };

   const reducer = (state: State, action: Action): State => {
     switch (action.type) {
       case 'FETCH_START':
         return { ...state, loading: true, error: null };
       case 'FETCH_SUCCESS':
         return { ...state, loading: false, users: action.payload };
       case 'FETCH_ERROR':
         return { ...state, loading: false, error: action.payload };
       case 'SET_FILTERS':
         return { ...state, filters: action.payload };
       default:
         return state;
     }
   };

   export const UserList: React.FC = () => {
     const [state, dispatch] = useReducer(reducer, initialState);

     // Component logic
   };
   ```

### Global State Management

1. **Context API for Application State**

   ```typescript
   // lib/context/AuthContext.tsx
   interface AuthContextValue {
     user: User | null;
     login: (credentials: LoginCredentials) => Promise<void>;
     logout: () => void;
     loading: boolean;
   }

   const AuthContext = React.createContext<AuthContextValue | null>(null);

   export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);

     const login = async (credentials: LoginCredentials) => {
       setLoading(true);
       try {
         const userData = await authService.login(credentials);
         setUser(userData);
       } finally {
         setLoading(false);
       }
     };

     const logout = () => {
       setUser(null);
       authService.logout();
     };

     return (
       <AuthContext.Provider value={{ user, login, logout, loading }}>
         {children}
       </AuthContext.Provider>
     );
   };

   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (!context) {
       throw new Error('useAuth must be used within AuthProvider');
     }
     return context;
   };
   ```

## Styling Guidelines

### CSS Modules

1. **Component-Specific Styles**

   ```css
   /* components/ui/Button/Button.module.css */
   .button {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     padding: 0.5rem 1rem;
     border: none;
     border-radius: 0.375rem;
     font-weight: 500;
     cursor: pointer;
     transition: all 0.2s ease;
   }

   .buttonPrimary {
     background-color: var(--color-primary);
     color: var(--color-white);
   }

   .buttonPrimary:hover {
     background-color: var(--color-primary-dark);
   }

   .buttonSecondary {
     background-color: var(--color-gray-100);
     color: var(--color-gray-900);
   }

   .buttonSm {
     padding: 0.25rem 0.5rem;
     font-size: 0.875rem;
   }

   .buttonLg {
     padding: 0.75rem 1.5rem;
     font-size: 1.125rem;
   }
   ```

2. **Responsive Design**

   ```css
   .container {
     max-width: 1200px;
     margin: 0 auto;
     padding: 0 1rem;
   }

   @media (min-width: 768px) {
     .container {
       padding: 0 2rem;
     }
   }

   @media (min-width: 1024px) {
     .container {
       padding: 0 3rem;
     }
   }
   ```

### CSS Variables and Theming

1. **Global Variables**

   ```css
   /* app/globals.css */
   :root {
     /* Colors */
     --color-primary: #3b82f6;
     --color-primary-dark: #2563eb;
     --color-secondary: #64748b;
     --color-white: #ffffff;
     --color-black: #000000;

     /* Spacing */
     --spacing-xs: 0.25rem;
     --spacing-sm: 0.5rem;
     --spacing-md: 1rem;
     --spacing-lg: 1.5rem;
     --spacing-xl: 2rem;

     /* Typography */
     --font-size-xs: 0.75rem;
     --font-size-sm: 0.875rem;
     --font-size-base: 1rem;
     --font-size-lg: 1.125rem;
     --font-size-xl: 1.25rem;

     /* Shadows */
     --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
     --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
     --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
   }

   [data-theme='dark'] {
     --color-primary: #60a5fa;
     --color-primary-dark: #3b82f6;
     --color-secondary: #94a3b8;
     --color-white: #1f2937;
     --color-black: #f9fafb;
   }
   ```

## Performance Optimization

### Code Splitting

1. **Dynamic Imports**

   ```typescript
   import dynamic from 'next/dynamic';

   // Dynamically import heavy components
   const ChartComponent = dynamic(() => import('@/components/Chart'), {
     loading: () => <div>Loading chart...</div>,
     ssr: false, // Disable server-side rendering if not needed
   });

   export const Dashboard: React.FC = () => {
     return (
       <div>
         <h1>Dashboard</h1>
         <ChartComponent />
       </div>
     );
   };
   ```

2. **Route-Based Code Splitting**
   ```typescript
   // Next.js automatically code-splits by route
   // app/dashboard/page.tsx will be split automatically
   ```

### Image Optimization

1. **Next.js Image Component**

   ```typescript
   import Image from 'next/image';

   export const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
     return (
       <Image
         src={user.avatar}
         alt={user.name}
         width={60}
         height={60}
         className={styles.avatar}
         priority={false} // Set to true for above-the-fold images
         placeholder="blur" // Add blur placeholder
         blurDataURL="data:image/jpeg;base64,..."
       />
     );
   };
   ```

### Memoization

1. **React.memo**

   ```typescript
   export const UserCard = React.memo<UserCardProps>(({ user, onUpdate }) => {
     return (
       <div className={styles.card}>
         <h3>{user.name}</h3>
         <p>{user.email}</p>
         <button onClick={() => onUpdate(user.id)}>Update</button>
       </div>
     );
   });

   // Custom comparison function
   export const UserCard = React.memo<UserCardProps>(
     ({ user, onUpdate }) => {
       // Component implementation
     },
     (prevProps, nextProps) => {
       return (
         prevProps.user.id === nextProps.user.id &&
         prevProps.user.updatedAt === nextProps.user.updatedAt
       );
     }
   );
   ```

2. **useMemo and useCallback**

   ```typescript
   export const UserList: React.FC<{ users: User[] }> = ({ users }) => {
     const [filter, setFilter] = useState('');

     const filteredUsers = useMemo(() => {
       return users.filter(user =>
         user.name.toLowerCase().includes(filter.toLowerCase())
       );
     }, [users, filter]);

     const handleUserUpdate = useCallback((userId: string) => {
       // Update logic
     }, []);

     return (
       <div>
         <input
           value={filter}
           onChange={(e) => setFilter(e.target.value)}
           placeholder="Filter users..."
         />
         {filteredUsers.map(user => (
           <UserCard key={user.id} user={user} onUpdate={handleUserUpdate} />
         ))}
       </div>
     );
   };
   ```

## Testing Guidelines

### Unit Testing with Jest and React Testing Library

1. **Component Testing**

   ```typescript
   // components/ui/Button/Button.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import { Button } from './Button';

   describe('Button', () => {
     it('renders children correctly', () => {
       render(<Button>Click me</Button>);
       expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
     });

     it('calls onClick when clicked', () => {
       const handleClick = jest.fn();
       render(<Button onClick={handleClick}>Click me</Button>);

       fireEvent.click(screen.getByRole('button'));
       expect(handleClick).toHaveBeenCalledTimes(1);
     });

     it('applies variant classes correctly', () => {
       render(<Button variant="secondary">Click me</Button>);
       const button = screen.getByRole('button');
       expect(button).toHaveClass('buttonSecondary');
     });
   });
   ```

2. **Hook Testing**

   ```typescript
   // lib/hooks/useApi.test.ts
   import { renderHook, waitFor } from '@testing-library/react';
   import { useApi } from './useApi';

   describe('useApi', () => {
     it('fetches data successfully', async () => {
       const mockData = { id: 1, name: 'Test' };
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: () => Promise.resolve(mockData),
       });

       const { result } = renderHook(() => useApi('/api/test'));

       expect(result.current.loading).toBe(true);

       await waitFor(() => {
         expect(result.current.loading).toBe(false);
         expect(result.current.data).toEqual(mockData);
       });
     });
   });
   ```

### Integration Testing

1. **Page Integration Tests**

   ```typescript
   // app/page.test.tsx
   import { render, screen } from '@testing-library/react';
   import Home from './page';

   describe('Home Page', () => {
     it('renders main heading', () => {
       render(<Home />);
       expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
     });

     it('contains navigation links', () => {
       render(<Home />);
       expect(screen.getByRole('link', { name: /examples/i })).toBeInTheDocument();
       expect(screen.getByRole('link', { name: /docs/i })).toBeInTheDocument();
     });
   });
   ```

## Accessibility Guidelines

### Semantic HTML

1. **Proper Semantic Structure**

   ```typescript
   export const ArticlePage: React.FC<{ article: Article }> = ({ article }) => {
     return (
       <article>
         <header>
           <h1>{article.title}</h1>
           <time dateTime={article.publishedAt}>
             {formatDate(article.publishedAt)}
           </time>
         </header>

         <main>
           <div dangerouslySetInnerHTML={{ __html: article.content }} />
         </main>

         <footer>
           <nav aria-label="Article navigation">
             <a href="/articles/prev">Previous</a>
             <a href="/articles/next">Next</a>
           </nav>
         </footer>
       </article>
     );
   };
   ```

### ARIA Attributes

1. **Accessible Forms**

   ```typescript
   export const SearchForm: React.FC = () => {
     const [query, setQuery] = useState('');
     const [results, setResults] = useState<SearchResult[]>([]);
     const [isLoading, setIsLoading] = useState(false);

     return (
       <form role="search" aria-label="Site search">
         <label htmlFor="search-input">Search:</label>
         <input
           id="search-input"
           type="search"
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           aria-describedby="search-help"
           aria-expanded={results.length > 0}
           aria-busy={isLoading}
         />
         <div id="search-help" className="sr-only">
           Enter search terms to find articles and documentation
         </div>

         {results.length > 0 && (
           <ul role="listbox" aria-label="Search results">
             {results.map((result) => (
               <li key={result.id} role="option">
                 <a href={result.url}>{result.title}</a>
               </li>
             ))}
           </ul>
         )}
       </form>
     );
   };
   ```

### Keyboard Navigation

1. **Focus Management**

   ```typescript
   export const Modal: React.FC<{
     isOpen: boolean;
     onClose: () => void;
     children: React.ReactNode;
   }> = ({ isOpen, onClose, children }) => {
     const modalRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
       if (isOpen) {
         modalRef.current?.focus();
         // Trap focus within modal
         const handleTabKey = (e: KeyboardEvent) => {
           if (e.key === 'Tab') {
             // Focus trap logic
           }
         };
         document.addEventListener('keydown', handleTabKey);
         return () => document.removeEventListener('keydown', handleTabKey);
       }
     }, [isOpen]);

     if (!isOpen) return null;

     return (
       <div className={styles.overlay} onClick={onClose}>
         <div
           ref={modalRef}
           className={styles.modal}
           onClick={(e) => e.stopPropagation()}
           role="dialog"
           aria-modal="true"
           tabIndex={-1}
         >
           <button
             className={styles.closeButton}
             onClick={onClose}
             aria-label="Close modal"
           >
             ×
           </button>
           {children}
         </div>
       </div>
     );
   };
   ```

## Security Guidelines

### XSS Prevention

1. **Safe Content Rendering**

   ```typescript
   // Bad: Vulnerable to XSS
   const BadComponent = ({ content }: { content: string }) => {
     return <div dangerouslySetInnerHTML={{ __html: content }} />;
   };

   // Good: Safe content rendering
   import DOMPurify from 'dompurify';

   const SafeContent = ({ content }: { content: string }) => {
     const cleanContent = DOMPurify.sanitize(content);
     return <div dangerouslySetInnerHTML={{ __html: cleanContent }} />;
   };

   // Better: Use text content when possible
   const SafeText = ({ content }: { content: string }) => {
     return <div>{content}</div>;
   };
   ```

### Authentication and Authorization

1. **Protected Routes**

   ```typescript
   // components/ProtectedRoute.tsx
   export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const { user, loading } = useAuth();
     const router = useRouter();

     useEffect(() => {
       if (!loading && !user) {
         router.push('/login');
       }
     }, [user, loading, router]);

     if (loading) {
       return <div>Loading...</div>;
     }

     if (!user) {
       return null;
     }

     return <>{children}</>;
   };

   // Usage in layout
   export default function DashboardLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <ProtectedRoute>
         <Dashboard>{children}</Dashboard>
       </ProtectedRoute>
     );
   }
   ```

### Data Protection

1. **Environment Variables**

   ```typescript
   // lib/config.ts
   export const config = {
     apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
     isDevelopment: process.env.NODE_ENV === 'development',
   };

   // Never expose sensitive data to the client
   // Use server-side API routes for sensitive operations
   ```

## Deployment Guidelines

### Build Optimization

1. **Next.js Configuration**

   ```javascript
   // next.config.js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // Enable experimental features
     experimental: {
       optimizeCss: true,
       optimizePackageImports: ['@repo/types'],
     },

     // Image optimization
     images: {
       domains: ['example.com'],
       formats: ['image/webp', 'image/avif'],
     },

     // Compression
     compress: true,

     // Headers for security
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
           ],
         },
       ];
     },
   };

   module.exports = nextConfig;
   ```

### Environment Configuration

1. **Environment Variables**

   ```bash
   # .env.local (never commit to version control)
   NEXT_PUBLIC_API_URL=https://api.blih-system.com
   NEXT_PUBLIC_APP_URL=https://app.blih-system.com
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

   # .env.production
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.blih-system.com
   ```

### Performance Monitoring

1. **Web Vitals**

   ```typescript
   // lib/monitoring.ts
   export function reportWebVitals(metric: any) {
     // Send to analytics service
     if (window.gtag) {
       window.gtag('event', metric.name, {
         value: Math.round(metric.value),
         event_category: 'Web Vitals',
         event_label: metric.id,
         non_interaction: true,
       });
     }
   }

   // app/layout.tsx
   import { reportWebVitals } from '@/lib/monitoring';

   export function reportWebVitals({
     id,
     name,
     label,
     value,
   }: {
     id: string;
     name: string;
     label: string;
     value: number;
   }) {
     // Report to analytics
   }
   ```

## Best Practices Summary

### Do's

- ✅ Use TypeScript with strict mode
- ✅ Follow component-first architecture
- ✅ Implement proper error boundaries
- ✅ Use semantic HTML for accessibility
- ✅ Optimize images and assets
- ✅ Write comprehensive tests
- ✅ Implement proper loading states
- ✅ Use CSS Modules for styling
- ✅ Follow React best practices
- ✅ Implement proper security measures

### Don'ts

- ❌ Use `any` type
- ❌ Ignore accessibility requirements
- ❌ Skip testing
- ❌ Use inline styles extensively
- ❌ Hardcode configuration values
- ❌ Ignore performance optimization
- ❌ Use dangerouslySetInnerHTML unnecessarily
- ❌ Skip error handling
- ❌ Create overly complex components
- ❌ Ignore SEO best practices

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Web.dev Performance](https://web.dev/performance/)

---

This document is a living guide. Please contribute to keeping it updated with the latest best practices and project-specific conventions.
