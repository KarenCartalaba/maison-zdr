# Phase 3: Event Workspace + API

## Goal
Create the Event Workspace page (`/admin/events/[id]`) with 5 tabs (Overview, Participants, Reviews, Highlights, Settings) and connect it to the backend API following the established architecture patterns.

## Architecture Patterns (from explorer)
- **Repositories**: Exported async functions wrapping Prisma calls
- **Services**: Exported async functions returning `{code, status, message, data}` 
- **Controllers**: Class-based with public async method properties
- **Routes**: Express Router with middleware chain: `authMiddleware.execute` → `permittedRole([...])` → `validateSchema(schema)` → `controller.method`
- **Schemas**: Zod with `{body, query, params}` structure
- **All routes use `/v1/` prefix**
- **Main router mounts sub-routers**: `router.use("/domain", domainRoutes)`

## Plan

### Phase 3a: Backend API (repositories, services, controllers, routes)
1. Create `admin.repository.ts` - admin dashboard stats queries
2. Create `admin.service.ts` - admin dashboard + event workspace services
3. Create `admin.controller.ts` - admin controller
4. Create `admin.routes.ts` - admin routes
5. Mount in `src/routes/index.ts`

### Phase 3b: Frontend Event Workspace
1. Create `/admin/events/[id]/page.tsx` - SSR page
2. Create `EventWorkspaceContent.tsx` - client component with 5 tabs
3. Create tab components: OverviewTab, ParticipantsTab, ReviewsTab, HighlightsTab, SettingsTab
4. Update frontend API service for admin endpoints
5. Connect to backend

### Phase 3c: Verification
1. Run `npm run build` in frontend
2. Verify build passes

## Dependencies
- Phase 3a must complete before Phase 3b (frontend needs API endpoints)
- Phase 3b and 3c can run in parallel after 3a

## Validation
- Backend: TypeScript compilation
- Frontend: `npm run build` passes with zero errors
