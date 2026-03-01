Application Flow

Public Flow

Landing Page
	•	Login
	•	Register

⸻

Registration Flow

Register
→ Enter company name
→ Enter email
→ Enter password
→ Submit
→ Redirect to Dashboard

⸻

Login Flow

Login
→ Email and password
OR
→ Login with Google
→ OAuth redirect
→ Backend generates JWT
→ Redirect to Dashboard

⸻

Authenticated Flow

Dashboard

Displays:
	•	Document summary
	•	Recent documents
	•	User role badge

Sidebar Navigation
	•	Dashboard
	•	Documents
	•	Upload
	•	Users (Admin only)
	•	Tenant Settings (Admin only)
	•	Logout

⸻

Documents Page
	•	List documents
	•	Filter by status
	•	Click document → Document Detail Page

⸻

Document Detail Page

Displays:
	•	Metadata
	•	Status
	•	Workflow history

Employee:
	•	Submit button

Manager:
	•	Approve
	•	Reject

⸻

Upload Page

Upload file
Enter title
Submit
Redirect to Documents

⸻

Users Page (Admin)
	•	List users
	•	Add user
	•	Edit role
	•	Delete user

⸻

Tenant Settings
	•	Edit company name
	•	Save changes

⸻

Logout
	•	Clear token
	•	Redirect to login
