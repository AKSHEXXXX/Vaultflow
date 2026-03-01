You will build frontend inside:

saas-platform/frontend

Backend remains untouched.

Below is your full production level frontend implementation plan.

==================================================
FRONTEND_IMPLEMENTATION_PLAN.md

PROJECT STRUCTURE

Root

saas-platform/
backend/
frontend/

Never import backend code into frontend.

⸻

PHASE 1
Frontend Setup and Isolation

1.1 Create frontend folder
1.2 Initialize Vite with React
1.3 Install dependencies
react-router-dom
axios
tailwindcss
framer-motion
lucide-react
1.4 Configure Tailwind
1.5 Add Inter font
1.6 Setup environment variable

VITE_API_BASE_URL=

Debugging Session 1
	•	Ensure frontend runs independently
	•	Confirm backend still builds
	•	Confirm no shared dependencies

Testing Session 1
	•	Run frontend dev server
	•	No console errors

Decision
Proceed only if frontend runs cleanly.

⸻

PHASE 2
Folder Structure

Create:

frontend/src/

api/
components/
layouts/
pages/
routes/
context/
hooks/
utils/

Do not create messy flat structure.

Debugging Session 2
	•	Ensure no unused imports
	•	Clean folder structure

Proceed?

⸻

PHASE 3
Design System

Create base components:

Button
Input
Card
Badge
Modal
Section
Container

Define:

Color palette
Spacing scale
Typography scale

Add hover animations.

Debugging Session 3
	•	Test each component in isolation
	•	Validate hover states
	•	Validate disabled states

Proceed?

⸻

PHASE 4
Landing Page

4.1 Navbar
4.2 Hero section
4.3 Features grid
4.4 Workflow section
4.5 CTA section
4.6 Footer

Add scroll reveal animations using Framer Motion.

Debugging Session 4
	•	Check animation smoothness
	•	Check responsive layout
	•	Check mobile behavior

Testing Session 4
	•	Scroll performance
	•	Button hover behavior

Proceed?

⸻

PHASE 5
App Layout

5.1 Sidebar layout
5.2 Top navigation
5.3 Protected route wrapper
5.4 Page transition animation

Debugging Session 5
	•	Test route navigation
	•	Confirm layout consistency
	•	Confirm sidebar collapse behavior

Proceed?

⸻

PHASE 6
Authentication System

6.1 Create axios instance
6.2 Add request interceptor for JWT
6.3 Add response interceptor for refresh
6.4 Create AuthContext
6.5 Implement login page
6.6 Implement register page
6.7 Implement logout

OAuth:

6.8 Add “Login with Google” button
6.9 Redirect to backend OAuth endpoint
6.10 Handle redirect and extract token

Debugging Session 6
	•	Validate token storage
	•	Validate refresh flow
	•	Validate redirect after login
	•	Validate protected route

Testing Session 6
	•	Login
	•	Refresh token
	•	Expire token simulation
	•	OAuth login

Proceed?

⸻

PHASE 7
Dashboard Page

7.1 KPI cards
7.2 Recent documents table
7.3 Status badges
7.4 Animated counters

Debugging Session 7
	•	Confirm API integration
	•	Confirm empty states
	•	Confirm loading skeleton

Proceed?

⸻

PHASE 8
Documents Module

8.1 Documents list page
8.2 Filter by status
8.3 Document details page
8.4 Timeline view for history
8.5 Submit button
8.6 Approve / Reject buttons

Add micro interactions.

Debugging Session 8
	•	Confirm role visibility
	•	Confirm status updates
	•	Confirm re-render after action

Proceed?

⸻

PHASE 9
Upload Page

9.1 Drag and drop component
9.2 Upload progress indicator
9.3 Success state
9.4 Error state

Debugging Session 9
	•	Test file upload
	•	Test large file
	•	Test failed upload

Proceed?

⸻

PHASE 10
User Management

10.1 Users table
10.2 Add user modal
10.3 Edit role
10.4 Delete user

Debugging Session 10
	•	Confirm admin-only visibility
	•	Confirm backend role enforcement

Proceed?

⸻

PHASE 11
Tenant Settings

11.1 View tenant info
11.2 Edit tenant name
11.3 Save and refresh UI

Debugging Session 11
	•	Confirm update works
	•	Confirm UI state refresh

Proceed?

⸻

PHASE 12
Global Error and Loading Handling

12.1 Global toast system
12.2 401 redirect handler
12.3 403 error modal
12.4 429 rate limit notification
12.5 Global loading overlay

Debugging Session 12
	•	Simulate backend errors
	•	Confirm UI behavior

Proceed?

⸻

PHASE 13
Polish Pass

13.1 Remove unused code
13.2 Standardize spacing
13.3 Optimize animations
13.4 Add smooth route transitions
13.5 Improve mobile responsiveness

Debugging Session 13
	•	Lighthouse test
	•	Console clean
	•	No layout shifts

Proceed?

⸻

PHASE 14
Production Build

14.1 Configure environment variables
14.2 Test build output
14.3 Confirm backend integration
14.4 Confirm CI compatibility

Final Testing
	•	Full login flow
	•	OAuth flow
	•	Document upload
	•	Workflow transition
	•	Role switching
	•	Rate limit handling

⸻

Important Rules While Sharing Repo
	•	Never mix frontend and backend dependencies
	•	Keep separate package.json
	•	Do not modify backend pom.xml
	•	Do not share node_modules in root
	•	Keep frontend fully isolated

⸻

Why This Workflow Works

You build:

Design → Layout → Auth → Features → Polish

Not random pages.
