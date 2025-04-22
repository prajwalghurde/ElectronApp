Screenshot App
An Electron-based desktop application for capturing screenshots with customizable features, designed for seamless user experience and efficient screenshot management.
Features

Custom Interval Screenshots: Capture screenshots at user-defined intervals (configurable in seconds).
Date-Based Organization: Automatically organize screenshots into folders by date (e.g., 2025-04-20/).
Screenshot Preview: View and browse all captured screenshots within the app.
System Tray Integration: Control the app via the system tray with options to start/stop capture and quit.
Auto-Launch: Optionally enable the app to start automatically on system boot.
Notifications: Receive alerts for capture start/stop and when screenshots are saved.

Installation

Clone the Repository:git clone https://github.com/your-username/screenshot-app.git


Navigate to the Project Folder:cd screenshot-app


Install Dependencies:npm install


Run the App:npm start



Building
To create a packaged executable for Windows or macOS:
npm run build


The packaged .exe (Windows) or .dmg (macOS) file will be generated in the dist/ folder.
For Windows, the .exe is a standalone installer ready for distribution.

Packaged Build
The packaged .exe file for Windows is available in the GitHub Releases section. Download and run the installer to use the app.
Screenshots

Note: Replace screenshots/preview.png, screenshots/tray-menu.png, and screenshots/folder-structure.png with actual screenshot paths in your repository.
License
This project is licensed under the MIT License - see the LICENSE file for details.
