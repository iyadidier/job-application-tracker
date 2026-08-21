# JobTrack — Project Documentation

## 1. Project Overview

JobTrack is a responsive web application designed to help job seekers organize and manage their job search in one place.

The application allows users to securely create an account, sign in, manage job applications, track interviews and offers, search and filter records, monitor key job-search metrics, and export data to CSV.

The application is deployed using GitHub Pages and uses Supabase for authentication and PostgreSQL database storage.

---

## 2. Business Problem

Job seekers often manage applications across spreadsheets, notes, emails, job boards, and calendar reminders.

This creates several problems:

* Applications can be forgotten.
* Follow-up dates can be missed.
* Interview information may be difficult to locate.
* Job posting links may become lost.
* Application statuses may not be updated consistently.
* It can be difficult to understand overall job-search performance.
* Personal job-search data may be scattered across several platforms.

JobTrack addresses this problem by providing one centralized application-tracking system.

---

## 3. Project Objective

The objective of JobTrack is to provide job seekers with a simple and secure system that allows them to:

* Track job applications.
* Maintain application status information.
* Track interviews and follow-ups.
* Save important job information.
* Search and filter applications.
* View useful dashboard metrics.
* Export application records.
* Access their information securely from multiple devices.

---

## 4. Project Scope

### In Scope

The current version of JobTrack includes:

* User registration
* Email confirmation
* User authentication
* Sign in
* Sign out
* Password recovery
* Password reset
* Application creation
* Application viewing
* Application editing
* Application deletion
* Application search
* Status filtering
* Application sorting
* Dashboard metrics
* CSV export
* Status colour indicators
* User-specific application data
* Row Level Security
* Responsive desktop and mobile design
* Success and error notifications
* GitHub Pages deployment

### Out of Scope

The current version does not include:

* Recruiter contact management
* Calendar integration
* Automated email reminders
* Resume storage
* Cover letter storage
* AI-generated application content
* Job board integrations
* Automated job imports
* Custom domains
* Push notifications

These may be considered future enhancements.

---

## 5. Target Users

The primary users are:

* Students
* Recent graduates
* Professionals searching for employment
* Career changers
* Individuals managing multiple job applications

---

## 6. Functional Requirements

### FR-01 — User Registration

The system shall allow a user to create an account using an email address and password.

### FR-02 — Email Confirmation

The system shall require users to confirm their email address before using the account where email confirmation is enabled.

### FR-03 — User Sign In

The system shall allow registered users to sign in using their email address and password.

### FR-04 — User Sign Out

The system shall allow authenticated users to securely sign out.

### FR-05 — Password Recovery

The system shall allow users to request a password-reset email.

### FR-06 — Password Reset

The system shall allow users with a valid recovery session to create a new password.

### FR-07 — Create Application

The system shall allow authenticated users to create a job application record.

### FR-08 — View Applications

The system shall display the authenticated user's job application records.

### FR-09 — Edit Application

The system shall allow authenticated users to update their own application records.

### FR-10 — Delete Application

The system shall allow authenticated users to delete their own application records.

### FR-11 — Search Applications

The system shall allow users to search applications using information such as company name, position, location, status, and notes.

### FR-12 — Filter Applications

The system shall allow users to filter applications by application status.

### FR-13 — Sort Applications

The system shall allow users to sort applications by date, company name, or position title.

### FR-14 — Dashboard Metrics

The system shall display:

* Total applications
* Interviews
* Offers
* Response rate

### FR-15 — Application Status

The system shall support the following statuses:

* Interested
* Applied
* Assessment
* Interview
* Offer
* Rejected
* Withdrawn

### FR-16 — Status Colour Indicators

The system shall visually distinguish application statuses using different colours.

### FR-17 — CSV Export

The system shall allow users to export their application records as a CSV file.

### FR-18 — User-Specific Records

The system shall ensure that users can only access application records associated with their own authenticated account.

### FR-19 — Notifications

The system shall display success or error messages for important user actions.

### FR-20 — Responsive Interface

The system shall provide a usable interface on desktop and mobile devices.

---

## 7. Non-Functional Requirements

### NFR-01 — Security

Application records must be protected using authentication and database authorization rules.

### NFR-02 — Privacy

Users must not be able to access another user's application records.

### NFR-03 — Usability

The interface should be simple enough for users without technical experience.

### NFR-04 — Responsiveness

The application should adapt to desktop, tablet, and mobile screen sizes.

### NFR-05 — Performance

Application records should load quickly under normal usage conditions.

### NFR-06 — Reliability

Saved records should remain available after browser refreshes and new sessions.

### NFR-07 — Maintainability

HTML, CSS, JavaScript, and Supabase configuration should remain separated into logical files.

### NFR-08 — Accessibility

Forms should include labels, semantic elements, and useful accessibility attributes where appropriate.

### NFR-09 — Data Integrity

Required application fields should be validated before data is submitted.

### NFR-10 — Compatibility

The application should function in modern desktop and mobile browsers.

---

## 8. User Stories

### US-01 — Create Account

As a job seeker, I want to create an account so that I can privately save my job applications.

### US-02 — Sign In

As a registered user, I want to sign in so that I can access my saved applications.

### US-03 — Reset Password

As a user who forgot my password, I want to reset it so that I can regain access to my account.

### US-04 — Add Application

As a job seeker, I want to record a new application so that I can track where I applied.

### US-05 — Edit Application

As a job seeker, I want to update an application so that its information remains current.

### US-06 — Delete Application

As a job seeker, I want to delete an application that I no longer need.

### US-07 — Search

As a user with many applications, I want to search my records so that I can find a specific application quickly.

### US-08 — Filter by Status

As a user, I want to filter applications by status so that I can focus on applications at a particular stage.

### US-09 — Sort Applications

As a user, I want to sort my applications so that I can organize them in a useful order.

### US-10 — View Metrics

As a user, I want to see job-search metrics so that I can quickly understand my current progress.

### US-11 — Export Data

As a user, I want to export my applications so that I can analyze or save them outside JobTrack.

### US-12 — Private Data

As a user, I want my application records to remain private so that other users cannot access my job-search information.

---

## 9. Acceptance Criteria

### AC-01 — Registration

Given that a visitor is not authenticated,
when they submit a valid email and password,
then an account should be created and the email-confirmation process should begin.

### AC-02 — Sign In

Given that a user has a valid account,
when they provide the correct credentials,
then they should be signed in and their applications should load.

### AC-03 — Invalid Sign In

Given that a user enters incorrect credentials,
when they attempt to sign in,
then the application should display an error message.

### AC-04 — Create Application

Given that a user is authenticated,
when they complete the required application fields and save,
then the new application should appear in their application list and be stored in the database.

### AC-05 — Edit Application

Given that an application exists,
when the user edits and saves it,
then the updated values should display and persist after refresh.

### AC-06 — Delete Application

Given that an application exists,
when the user confirms deletion,
then the application should be removed from the database and interface.

### AC-07 — Search

Given that applications exist,
when the user enters a matching search term,
then only matching applications should be displayed.

### AC-08 — Filter

Given that applications have different statuses,
when the user selects a status filter,
then only applications with that status should be shown.

### AC-09 — Data Isolation

Given two authenticated users,
when User A signs in,
then User A must not be able to view User B's applications.

### AC-10 — Password Reset

Given that a user requests a password reset,
when they follow a valid recovery link and enter a valid new password,
then the new password should replace the previous password.

### AC-11 — CSV Export

Given that the user has saved applications,
when they select Export CSV,
then a CSV file containing their records should be downloaded.

### AC-12 — Responsive Layout

Given that JobTrack is opened on a mobile device,
when the user navigates the interface,
then the application should remain usable without unintended horizontal scrolling or inaccessible controls.

---

## 10. Application Data Model

### Main Entity

The primary database entity is:

`job_applications`

### Key Fields

| Field                | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `id`                 | Unique application identifier                   |
| `user_id`            | Links the application to the authenticated user |
| `company_name`       | Employer name                                   |
| `position_title`     | Job title                                       |
| `job_location`       | Job location                                    |
| `status`             | Current application stage                       |
| `application_date`   | Date application was submitted                  |
| `salary_information` | Salary or compensation information              |
| `job_posting_url`    | Link to original job posting                    |
| `interview_date`     | Scheduled interview date                        |
| `follow_up_date`     | Planned follow-up date                          |
| `notes`              | Additional application information              |
| `created_at`         | Record creation timestamp                       |
| `updated_at`         | Record update timestamp                         |

---

## 11. Database Relationships

Each authenticated user can have multiple job applications.

Conceptually:

```text
User
  |
  | 1
  |
  |------< Many Job Applications
```

The `user_id` field in `job_applications` identifies the user who owns each application.

---

## 12. Security Design

JobTrack uses two primary security layers.

### Authentication

Supabase Authentication determines whether a user is signed in.

Authentication functionality includes:

* Registration
* Email confirmation
* Sign in
* Session management
* Sign out
* Password recovery
* Password updates

### Authorization

PostgreSQL Row Level Security determines which database records an authenticated user can access.

The core ownership rule is based on:

```sql
auth.uid() = user_id
```

This rule is applied to appropriate operations including:

* SELECT
* INSERT
* UPDATE
* DELETE

---

## 13. Security Testing

Two separate user accounts were used to test data isolation.

### Test Account A

Account A created a unique application record.

### Test Account B

Account B signed in separately.

Expected result:

Account B must not see Account A's record.

Actual result:

Account B could not see Account A's record.

A separate record was then created using Account B.

After signing back into Account A:

* Account A could see Account A's record.
* Account A could not see Account B's record.

Result:

**Passed**

This verified that Row Level Security was functioning correctly.

---

## 14. Application Architecture

```text
User Browser
     |
     v
GitHub Pages
     |
     v
HTML / CSS / JavaScript
     |
     +----------------------+
     |                      |
     v                      v
Supabase Authentication    Supabase PostgreSQL
     |                      |
     v                      v
Authenticated User         job_applications
                            |
                            v
                      Row Level Security
                            |
                            v
                    User-Specific Records
```

---

## 15. Data Flow

### Application Creation

```text
User enters job information
        |
        v
JavaScript validates form
        |
        v
Supabase insert request
        |
        v
Authentication identifies user
        |
        v
Row Level Security validates access
        |
        v
PostgreSQL saves application
        |
        v
Saved record returned to interface
```

### Application Loading

```text
User signs in
      |
      v
Supabase Authentication
      |
      v
Authenticated User ID
      |
      v
Application requests records
      |
      v
Row Level Security
      |
      v
Only user's records returned
      |
      v
Dashboard and application list rendered
```

---

## 16. Testing Summary

The following areas were manually tested.

### Authentication Testing

* Account creation
* Email confirmation
* Valid sign in
* Invalid sign in
* Sign out
* Password recovery
* Password update

### CRUD Testing

* Create application
* Read application
* Update application
* Delete application

### Application Features

* Search
* Status filter
* Sorting
* Dashboard calculations
* Status colour changes
* CSV export
* Notifications

### Security Testing

* User data isolation
* Row Level Security

### Responsive Testing

* Desktop browser
* Narrow desktop window
* Mobile browser
* Application modal
* Authentication modal
* Search controls
* Dashboard cards
* Notifications

---

## 17. Deployment

JobTrack is deployed using GitHub Pages.

### Production URL

[https://iyadidier.github.io/job-application-tracker/](https://iyadidier.github.io/job-application-tracker/)

### Deployment Source

```text
Branch: main
Folder: / (root)
```

### Production Authentication Configuration

Supabase authentication is configured to allow the GitHub Pages production URL.

Production Site URL:

```text
https://iyadidier.github.io/job-application-tracker/
```

Password-reset redirect:

```text
https://iyadidier.github.io/job-application-tracker/reset-password.html
```

Local development URLs are retained for development and testing.

---

## 18. Version Control

Git is used for source control.

GitHub is used for:

* Remote repository hosting
* Commit history
* Source backup
* Deployment through GitHub Pages

Development changes are tested locally before being committed and pushed to the `main` branch.

---

## 19. Key Technical Challenges

### Authentication Integration

The application originally stored job applications in browser localStorage.

The project was later upgraded to use Supabase Authentication and PostgreSQL storage.

### User Data Isolation

Row Level Security policies were implemented and tested to prevent users from accessing records belonging to other users.

### Password Recovery

A separate password-reset page and JavaScript flow were created to support Supabase password recovery.

### Production Redirects

Authentication redirect URLs had to support both local development and the GitHub Pages production path.

### Responsive User Interface

The application was tested and adjusted to remain usable on both desktop and mobile devices.

---

## 20. Future Enhancements

Potential future improvements include:

### Analytics

* Applications submitted this month
* Interview conversion rate
* Offer conversion rate
* Rejection rate
* Application trend charts

### Reminders

* Follow-up reminders
* Interview reminders
* Application deadlines

### Contact Management

* Recruiter names
* Recruiter email addresses
* Recruiter phone numbers
* Networking contacts

### Document Management

* Resume versions
* Cover letters
* Job descriptions
* Supporting documents

### Integrations

* Google Calendar
* Outlook Calendar
* Job board imports
* Email integration

### User Experience

* Dark mode
* Additional dashboard customization
* Improved mobile navigation

### Production Infrastructure

* Custom domain
* Custom SMTP email provider
* Automated testing
* Continuous integration
* Error monitoring

---

## 21. Project Outcome

JobTrack successfully demonstrates a complete web-application workflow including:

* User authentication
* Database integration
* CRUD functionality
* Authorization
* Security testing
* Search and filtering
* Dashboard metrics
* Data export
* Responsive design
* Version control
* Production deployment

The final application is available online and can securely maintain separate application records for multiple users.

---

## 22. Author

**Didier Iyamuremye**

GitHub:

[https://github.com/iyadidier](https://github.com/iyadidier)

