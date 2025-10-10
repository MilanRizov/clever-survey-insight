# Survey Application - Project Summary

## Project Overview
A comprehensive survey management platform built with React, TypeScript, Supabase, and Tailwind CSS. The application allows users to create, manage, and analyze surveys with advanced reporting and analytics capabilities.

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6.30.1
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Drag & Drop**: @dnd-kit for survey builder
- **Charts**: Highcharts & Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Supabase Edge Functions (Deno runtime)
- **Storage**: Supabase Storage
- **Project ID**: qvpbzafhnaauxdlzteza

### Key Dependencies
- lucide-react (icons)
- date-fns (date manipulation)
- sonner (toast notifications)
- next-themes (dark/light mode)

---

## Core Features

### 1. Authentication & User Management
- **Login/Signup System**: Email-based authentication
- **User Roles**: Admin and regular user roles
- **Session Management**: Persistent sessions with Supabase Auth
- **Protected Routes**: Route guards for authenticated pages

**Files**:
- `src/pages/Auth.tsx` - Authentication page
- `src/components/auth/LoginForm.tsx` - Login component
- `src/components/auth/SignUpForm.tsx` - Registration component
- `src/hooks/useAuth.tsx` - Authentication hook

### 2. Survey Builder
- **Drag & Drop Interface**: Reorderable questions using @dnd-kit
- **Question Types Palette**: Multiple question types available
- **Visual Canvas**: Interactive survey design interface
- **Real-time Preview**: Live preview of survey as you build

**Files**:
- `src/pages/CreateSurvey.tsx` - Survey creation page
- `src/pages/EditSurvey.tsx` - Survey editing page
- `src/components/survey/SurveyBuilder.tsx` - Main builder component
- `src/components/survey/QuestionCanvas.tsx` - Question canvas
- `src/components/survey/QuestionTypePalette.tsx` - Question types
- `src/components/survey/SortableQuestion.tsx` - Draggable questions

### 3. Survey Management
- **My Surveys Page**: Lists all surveys with clear distinction
  - **My Surveys Section**: Surveys created by logged-in user
  - **All Surveys Section**: Surveys created by other users
  - Visual distinction with different styling
  - Edit access only for owned surveys
- **Survey Templates**: Pre-built survey templates
- **Survey Preview**: Preview before publishing
- **Public Survey Access**: Shareable public links

**Files**:
- `src/pages/MySurveys.tsx` - Survey listing (with user distinction)
- `src/pages/Templates.tsx` - Survey templates
- `src/pages/SurveyPreview.tsx` - Preview mode
- `src/pages/PublicSurvey.tsx` - Public survey view
- `src/data/templates.ts` - Template definitions

### 4. Reporting & Analytics

#### Individual Survey Reports
- **Survey Report Page**: Detailed analytics per survey
- **Response Timeline Chart**: Visualize responses over time
- **Question Analysis**: Per-question response breakdown
- **Export Capabilities**: Export report data

**Files**:
- `src/pages/SurveyReport.tsx` - Individual survey report
- `src/components/survey/charts/SurveyCharts.tsx` - Chart components
- `src/components/survey/charts/ResponseTimelineChart.tsx` - Timeline visualization

#### Global Analytics
- **Dashboard**: Overview of all survey statistics
- **Global Analytics Page**: Aggregate analytics across surveys
- **Registered Users**: User management view
- **Reports Page**: Comprehensive reporting interface

**Files**:
- `src/pages/Dashboard.tsx` - Main dashboard
- `src/pages/GlobalAnalytics.tsx` - Global analytics
- `src/pages/RegisteredUsers.tsx` - User management
- `src/pages/Reports.tsx` - Reports listing

### 5. AI-Powered Analysis
- **Open Text Analysis**: AI-powered topic extraction from open-ended responses
- **Edge Function**: `analyze-open-text` for processing
- **Error Handling**: Comprehensive error logging and handling

**Files**:
- `supabase/functions/analyze-open-text/index.ts` - AI analysis edge function

**Known Issues**:
- Edge function returns 401 errors (OpenAI API authentication issue)
- Requires OPENAI_API_KEY secret configuration

---

## Application Structure

### Layout & Navigation
- **Global Sidebar**: Persistent navigation across all pages
- **App Layout**: Consistent layout wrapper
- **Responsive Design**: Mobile-friendly interface

**Files**:
- `src/components/layout/AppLayout.tsx` - Main layout component
- `src/App.tsx` - Root application component with routing

### Routing Configuration
```
/ - Index/Landing page
/auth - Authentication (Login/Signup)
/dashboard - Main dashboard
/create - Create new survey
/edit/:id - Edit existing survey
/my-surveys - Survey management (My Surveys + All Surveys)
/templates - Survey templates
/preview/:id - Survey preview
/survey/:id - Public survey view
/reports - Reports listing
/reports/:id - Individual survey report
/global-analytics - Global analytics
/registered-users - User management
/404 - Not found page
```

### Design System
- **Color Tokens**: HSL-based semantic color system
- **Component Variants**: Reusable UI component variants
- **Responsive Utilities**: Mobile-first design approach
- **Dark/Light Mode**: Theme switching support

**Files**:
- `src/index.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/*` - Reusable UI components (50+ components)

---

## Database Schema

### Supabase Configuration
- **Project**: qvpbzafhnaauxdlzteza
- **Region**: Auto-selected by Supabase
- **RLS Enabled**: Row Level Security policies implemented

### Key Tables (Inferred)
- `surveys` - Survey metadata and configuration
- `questions` - Survey questions
- `responses` - Survey response data
- `users` or `profiles` - User profiles (linked to auth.users)

### Security
- **RLS Policies**: Row-level security for data access
- **Authentication Required**: Most operations require auth
- **User-specific Data**: Users only see their own data

---

## Known Issues & Technical Debt

### Edge Function Errors
**Issue**: `analyze-open-text` returns 401 errors
- Error: "OpenAI API error: 401"
- Cause: Missing or invalid OPENAI_API_KEY
- Impact: AI-powered topic analysis not functional

**Resolution Required**:
1. Add OPENAI_API_KEY secret in Supabase dashboard
2. Configure OpenAI API credentials
3. Test edge function after configuration

### Console Errors
Multiple instances of:
```
Error analyzing topics: FunctionsHttpError: Edge Function returned a non-2xx status code
```

**Timestamps**:
- 2025-10-10T08:09:58Z
- 2025-10-10T08:30:19Z
- 2025-10-10T09:28:49Z
- 2025-10-10T10:27:19Z
- 2025-10-10T11:47:00Z
- 2025-10-10T11:48:00Z

---

## Recent Changes & Improvements

### Route Configuration
- **Fixed**: Added `/reports/:id` route for SurveyReport component
- **Issue**: 404 errors when clicking "View Report"
- **Resolution**: Updated `App.tsx` with proper route mapping

### Survey Management Enhancement
- **Feature**: Clear distinction between owned and other surveys
- **Implementation**: Separated "My Surveys" and "All Surveys" sections
- **UX**: Different styling and access controls per section
- **File Modified**: `src/pages/MySurveys.tsx`

### Sidebar Visibility
- **Feature**: Made sidebar globally visible
- **Commit**: "Make sidebar visible globally" (Aug 21, 2025)
- **Commit SHA**: 7426384534fa6a7c86ee95bee7f75b45ff16f01d

---

## Configuration Files

### Environment
- `.env` - Environment variables (not in version control)
- `supabase/config.toml` - Supabase project configuration

### Build & Development
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - ESLint rules
- `components.json` - shadcn/ui configuration

### Public Assets
- `public/robots.txt` - SEO configuration
- `public/favicon.ico` - Site favicon
- `public/placeholder.svg` - Placeholder images

---

## Best Practices Implemented

### Code Organization
- **Component-based**: Modular, reusable components
- **Type Safety**: Full TypeScript coverage
- **Custom Hooks**: Reusable logic in hooks
- **Consistent Naming**: Clear, descriptive file names

### Performance
- **React Query**: Efficient data fetching and caching
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: On-demand component loading

### Security
- **RLS Policies**: Database-level security
- **Protected Routes**: Authentication guards
- **Input Validation**: Zod schemas for form validation
- **Secure API Calls**: Authenticated Supabase requests

### UX/UI
- **Toast Notifications**: User feedback with Sonner
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error messages
- **Responsive Design**: Mobile-first approach

---

## Future Recommendations

### Immediate Fixes
1. ✅ Configure OPENAI_API_KEY for edge function
2. ✅ Test AI analysis feature end-to-end
3. ✅ Monitor edge function logs for errors

### Potential Enhancements
1. **Export Functionality**: Export survey results to CSV/PDF
2. **Advanced Filters**: Filter surveys by date, status, category
3. **Collaboration**: Multi-user survey editing
4. **Webhooks**: Real-time response notifications
5. **Advanced Charts**: More visualization options
6. **Survey Logic**: Conditional questions and branching
7. **Response Validation**: Custom validation rules
8. **Email Notifications**: Automated survey invitations
9. **API Access**: REST API for external integrations
10. **Backup & Restore**: Automated backup system

### Performance Optimization
1. Implement virtualization for long survey lists
2. Optimize chart rendering for large datasets
3. Add pagination to survey responses
4. Cache frequently accessed data

### Testing
1. Add unit tests for critical components
2. Implement E2E tests for user flows
3. Add integration tests for API calls
4. Set up CI/CD pipeline

---

## Deployment Information

### Current Status
- **Environment**: Development/Preview
- **Preview URL**: Available via Lovable snapshot system
- **Build Status**: Successful
- **Latest Build**: Aug 21, 2025 20:47:58 GMT+0200

### Deployment Process
1. Code changes trigger automatic builds
2. Preview environments for each commit
3. Snapshot system for version history
4. Restore capability for rollbacks

---

## Support & Resources

### Supabase Dashboard Links
- **SQL Editor**: https://supabase.com/dashboard/project/qvpbzafhnaauxdlzteza/sql/new
- **Authentication**: https://supabase.com/dashboard/project/qvpbzafhnaauxdlzteza/auth/providers
- **Users**: https://supabase.com/dashboard/project/qvpbzafhnaauxdlzteza/auth/users
- **Edge Functions**: https://supabase.com/dashboard/project/qvpbzafhnaauxdlzteza/functions
- **Function Secrets**: https://supabase.com/dashboard/project/qvpbzafhnaauxdlzteza/settings/functions
- **Storage**: https://supabase.com/dashboard/project/qvpbzafhnaauxdlzteza/storage/buckets

### Documentation
- Lovable Docs: https://docs.lovable.dev/
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs

---

## Summary Statistics

- **Total Pages**: 13
- **Total Components**: 50+ UI components + custom components
- **Database Tables**: Multiple (surveys, questions, responses, users)
- **Edge Functions**: 1 (analyze-open-text)
- **Routes**: 12 main routes + 404
- **Dependencies**: 50+ npm packages
- **Build Tool**: Vite
- **UI Framework**: React 18
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Functions)

---

**Document Generated**: 2025-10-10  
**Project Status**: Active Development  
**Last Major Update**: Survey management distinction feature (My Surveys vs All Surveys)
