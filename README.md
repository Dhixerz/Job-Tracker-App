# Job Application Tracker

A React and Electron-based desktop application to easily and quickly track your job applications.

## How to Use

This application has been packaged into an installer (`.exe`) file so you can directly install and use it.

### 1. Install the Application
If you haven't installed it yet, please run the following installation file:
`dist/Job Tracker Setup 2.0.23.exe` (or the latest version available in the `dist` folder).

Follow the on-screen instructions, and the application will be automatically installed and can be opened via the Desktop shortcut.

### 2. How to Run for Development

If you want to run this application in development mode or modify the source code:

1. Ensure you have **Node.js** installed on your computer.
2. Open this project folder in your terminal/CMD: `C:\Trae AI Projects\job-application-tracker`
3. Run the following command to install all dependencies:
   ```bash
   npm install
   ```
4. Once the installation is complete, run the following command to start the application in development mode:
   ```bash
   npm run dev
   ```
   *This command will start the React server (Vite) and simultaneously open the Electron window.*

### 3. How to Build a New Version

If you have made changes to the source code and want to create a new `.exe` installation file, run the following command:

```bash
npm run build
```

This process will take about 30-60 seconds. Once completed, the new `.exe` file will be available in the `dist\` folder.

---

## Key Features

- **Kanban Board**: Drag and drop your job applications across various statuses (Applied, Interviewing, Rejected, Offered).
- **LinkedIn Auto-Scraping**: Simply copy and paste a job posting link from LinkedIn, click "Track This Job", and all data will be automatically filled in (Title, Company, Location Type, Years of Experience, Point of Contact, etc).
- **Flexible Currencies**: Track salaries using various currencies (IDR, USD, EUR, SGD, etc).
- **Smart Filters**: Search for job applications based on Status, Location Type, or Company Name.
