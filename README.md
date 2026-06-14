# Job Application Tracker

A React and Electron-based desktop application to easily and quickly track your job applications.

## How to Use

This application has been packaged into an installer (`.exe`) file so you can directly install and use it.

### Option 1: Install the Pre-built Application
Since the installer files are too large for GitHub, you can download the ready-to-use `.exe` installer directly from this link:
**[Download Job Tracker Installer (Google Drive)](https://drive.google.com/drive/folders/1pD419Uxqoux2YB0OAp_xiQWswCz2oUzm?usp=sharing)**

Download the `.exe` file, run it, and follow the on-screen instructions. The application will be automatically installed and can be opened via the Desktop shortcut.

### Option 2: How to Run for Development

If you want to run this application in development mode or modify the source code:

1. Ensure you have **Node.js** installed on your computer.
2. Open your terminal/CMD and navigate to the project folder where you cloned or extracted the source code.
3. Run the following command to install all dependencies:
   ```bash
   npm install
   ```
4. Once the installation is complete, run the following command to start the application in development mode:
   ```bash
   npm run dev
   ```
   *This command will start the React server (Vite) and simultaneously open the Electron window.*

### Option 3: How to Build a New Version

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
