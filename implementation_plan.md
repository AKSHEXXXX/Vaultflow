Implementation Plan

Phase 1 Core Setup

1.1 Initialize Spring Boot project
1.2 Configure PostgreSQL
1.3 Configure Flyway
1.4 Create BaseEntity
1.5 Setup Docker Compose
1.6 Run app

Debugging Session 1
	•	Validate DB connection
	•	Check migration success
	•	Check startup logs

Testing Session 1
	•	Hit /api/health
	•	Verify tables exist

Lock phase before moving.

⸻

Phase 2 Authentication

2.1 Create Tenant entity
2.2 Create User entity
2.3 Register API
2.4 Login API
2.5 JWT provider
2.6 JWT filter
2.7 Secure endpoints

Debugging Session 2
	•	Validate JWT creation
	•	Validate protected routes
	•	Check password hashing

Testing Session 2
	•	Register
	•	Login
	•	Invalid login
	•	Unauthorized access

⸻

Phase 3 OAuth

3.1 Configure Google OAuth
3.2 OAuth success handler
3.3 Generate internal JWT
3.4 Map user to tenant

Debugging Session 3
	•	Validate redirect
	•	Validate JWT after OAuth

Testing Session 3
	•	Google login
	•	Access protected route

⸻

Phase 4 Documents

4.1 Create Document entity
4.2 Integrate S3
4.3 Upload API
4.4 List API
4.5 Download API

Debugging Session 4
	•	Validate S3 upload
	•	Validate tenant isolation

Testing Session 4
	•	Upload
	•	Download
	•	Cross tenant attempt

⸻

Phase 5 Workflow

5.1 Status enum
5.2 Submit endpoint
5.3 Approve endpoint
5.4 Reject endpoint
5.5 History logging

Debugging Session 5
	•	Validate status transitions
	•	Validate role enforcement

Testing Session 5
	•	Submit
	•	Approve
	•	Reject

✅ Resolved — Role Enforcement (User Management Module)
	•	Added UserController, UserService, and DTOs (UserResponse, InviteUserRequest, UpdateRoleRequest)
	•	POST /api/v1/users/invite — ADMIN can create EMPLOYEE/MANAGER users in the same tenant
	•	PUT /api/v1/users/{id}/role — ADMIN can change any tenant user's role
	•	DELETE /api/v1/users/{id} — ADMIN can remove users
	•	GET /api/v1/users/me — any user can view their own profile
	•	GET /api/v1/users — any user can list all users in the same tenant
	•	Workflow role enforcement (submit=EMPLOYEE/ADMIN, approve/reject=MANAGER/ADMIN) is now fully testable

⸻

Phase 6 Redis

6.1 Configure Redis
6.2 Cache document list
6.3 Cache invalidation
6.4 Rate limiting filter

Debugging Session 6
	•	Validate cache hit
	•	Validate TTL
	•	Validate 429 response

Testing Session 6
	•	Load test endpoint
	•	Confirm rate limit works

⸻

Phase 7 Frontend

7.1 Setup React + Vite
7.2 Routing
7.3 Login page
7.4 Dashboard
7.5 Document list
7.6 Upload page
7.7 Users page

Debugging Session 7
	•	Validate token handling
	•	Check console errors

Testing Session 7
	•	Full user flow

⸻

Phase 8 Deployment

8.1 Dockerize backend
8.2 Dockerize frontend
8.3 Setup Nginx
8.4 Deploy to EC2
8.5 Configure RDS and S3

Debugging Session 8
	•	Check environment variables
	•	Check production logs

Testing Session 8
	•	Full production flow

⸻

Phase 9 CI/CD

9.1 Create GitHub Actions workflow
9.2 Add Docker build
9.3 Add test stage
9.4 Push to Docker Hub
9.5 SSH deploy to EC2

Debugging Session 9
	•	Validate pipeline execution
	•	Validate image push

Testing Session 9
	•	Push to main
	•	Confirm auto deploy
	•	Validate live app update
