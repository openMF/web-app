# Mifos X Web App ![build](https://github.com/openMF/web-app/actions/workflows/build.yml/badge.svg)

## Overview

Mifos X Web App is a modern single-page application (SPA) built on top of the Mifos X platform for financial inclusion. It serves as the default web interface for the Mifos user community.

**Technologies Used:**

- HTML5, SCSS, and TypeScript
- Angular framework
- Angular Material components

## Installation Guide

### Prerequisites for All Methods

- Git: [Download here](https://git-scm.com/downloads)
- Mifos X Backend (Fineract) - **Required before running the web app**

### Backend Setup (REQUIRED FIRST)
- For backend, either take the shortcut of using (/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security --user-data-dir="/tmp/ChromeDev") for testing.
- Else, try using docker if you have a PC/Laptop with good specifications.

### Frontend Setup (Web App)

#### Preferred Method: Manual Installation

1. Install Node.js: [Download here](https://nodejs.org/en/download/)
2. Install Angular CLI:
   ```
   npm install -g @angular/cli@16.0.2
   ```
3. Clone the repository:
   ```
   git clone https://github.com/openMF/web-app.git
   ```
   For Windows:
   ```
   git clone https://github.com/openMF/web-app.git --config core.autocrlf=input
   ```
4. Navigate to the project directory:
   ```
   cd web-app
   ```
5. Install dependencies:
   ```
   npm install
   ```
6. Start the development server:
   ```
   ng serve
   ```
7. Access the application at `http://localhost:4200/`

## Default Login Credentials

When using the development server with basic authentication:

- **Username:** mifos
- **Password:** password

**Important:** Do not alter these credentials.

## Update Log

Ongoing documentation of daily progress, research, and implementation efforts.

**Timeline**
16–21 November

<details> <summary><strong>Show Details</strong></summary>

Reviewed all relevant documentation and requirements.

Refined and finalized the Product Requirement Document (PRD).

Completed the viva on 21 November.

</details>
22 November
<details> <summary><strong>Show Details</strong></summary>

Identified viable closed PRs related to our feature scope.

Tagged them for deeper analysis.

</details>
23 November
<details> <summary><strong>Show Details</strong></summary>

Analyzed shortlisted PRs in detail.

Reviewed implementation decisions, change sets, and architectural impact.

</details>
24 November
<details> <summary><strong>Show Merged PRs Reviewed</strong></summary>

Focused on merged pull requests relevant to the project.

Reviewed:

#2790 — WEB-369-fix(oauth2): Replace localStorage with sessionStorage in callback component
https://github.com/openMF/web-app/pull/2790

#2798 — Revert: WEB-394-fix — Remove direct JSON.parse usages, restore previous behavior
https://github.com/openMF/web-app/pull/2798

#2757 — WEB-399-fix(webappcomponent): Add RxJS cleanup & unsubscribe handlers to prevent memory leaks
https://github.com/openMF/web-app/pull/2757

</details>
25 November
<details> <summary><strong>Show Details</strong></summary>

Fixed all the issues with launching through client side AGAIN.

Reviewed implementation decisions, change sets, and architectural impact again.

</details>
26 November
<details> <summary><strong>Show Details</strong></summary>

Created test changes and pushed data to our Repo.

Planned further changes and started working on them locally.

</details>
27 November
<details> <summary><strong>Show Details</strong></summary>

Rehan finished working on the home page's HTML/CSS and added shortcuts to other pages.

</details>
28 November
<details> <summary><strong>Show Details</strong></summary>

Fixed conflicts with other scripts.

</details>
29 November
<details> <summary><strong>Show Details</strong></summary>

Deepanshu finished his work on merging the dashboard and home components.

</details>
30 November & 1 December
<details> <summary><strong>Show Details</strong></summary>

Fixed conflicts and resolved data-related issues with graphs in Deepanshu’s part.

</details>
2 & 3 December
<details open> <summary><strong>Show Details</strong></summary>

Pushed and merged code to the final repo.

</details>
