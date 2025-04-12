<div style="text-align: center; margin-bottom: 20px;">
    <a href="./readme.md"><button onclick="toggleLanguage('cn')">中文</button></a>
    <button>English</button>
</div>

# GeoGebra Presentation Solution for In-Class Teaching

## Project Background

As a mathematics teacher, I often need to demonstrate dynamic plane and solid geometry figures in class and integrate various teaching resources. The traditional method requires carrying a USB drive and manually running GeoGebra software, which is cumbersome. To simplify the process, I developed the FileVue project, utilizing GeoGebra's web display functionality and supporting local file resource presentation, allowing teachers to directly access required resources through a web page, significantly improving teaching efficiency.

## Features
### Core Features
- Server sends file directory to client
- Client (browser) implements file directory display through recursion
- Supports custom web display methods for various file types

### Technology Comparison
| Feature        | Caching & Compression | File Upload | Lightweight |
|:--------------:|:---------------------:|:-----------:|:-----------:|
| Everything     | No                   | No         | Yes         |
| Nginx          | Yes                  | No         | Yes         |
| MinIO          | Yes                  | Yes        | No          |
| This Project   | Yes                  | Yes        | Yes         |

### Project Advantages
1. 🧩 **Frontend-Backend Separation**: Backend can flexibly switch programming languages and frameworks, recursively sending file directories; frontend is handled by `fileVue.js`, requiring no additional dependencies
2. 📦 **Packaging**: `fileVue.js` is packaged as a library, ensuring an independent runtime environment
3. 🎨 **Non-invasive Design**: Frontend supports custom processing for files with any extension, including `.ggb`
4. ⚡ **Performance Optimization**: Backend supports caching and file compression, significantly improving access speed, with fast response for `.ggb` files
5. 🛠️ **Flexible Configuration**: Supports frontend and backend configuration to meet personalized needs

## Quick Start
### Core Files
- `FileVue.exe`: Main program file
- `public` folder: Frontend resource files
- `config.js`: Configuration file

### Open Source Address
The project is open source, welcome to contribute: [https://gitee.com/wangwangqin523/file-vue.git](https://gitee.com/wangwangqin523/file-vue.git)

### Demo
<figure>
    <img src="./assets/demo.gif" alt="Demo Animation">
    <figcaption>Figure 1: FileVue Demo Animation</figcaption>
</figure>

## Project Structure
<figure>
    <img src="./assets/项目流程图.png" alt="Project Flowchart">
    <figcaption>Figure 2: Project Flowchart</figcaption>
</figure>

<figure>
    <img src="./assets/filevue.js时序图.png" alt="filevue.js Sequence Diagram">
    <figcaption>Figure 3: filevue.js Sequence Diagram</figcaption>
</figure>

### Installation Steps
1. On Windows system，download the zip file: [fileVue-win-x64.zip](https://gitee.com/wangwangqin523/file-vue/raw/master/fileVue-win-x64.zip)
2. Place `FileVue.exe`, `config.js`, and the `public` folder in the same directory
3. Double-click to run `FileVue.exe`
4. Open your browser and visit `http://localhost:8888`

**From now on, simply save local files to the `public` folder to access them directly via browser through LAN or internet**

### Configuration Instructions
#### Server Configuration
Modify the `config.js` file to support custom parameters. For example: you can rename the `public` folder or move it to another directory, and modify the `staticFolder` parameter accordingly. If not modified, default configuration will be used.
```javascript
module.exports = {
    port: 8888,         // Server listening port
    enableUpload: true, // Whether to enable file upload function
    staticFolder: 'D:/public2' // Static resource folder path, must use forward slashes, not backslashes
};
```
#### Client Configuration
Include fileVue.js, fileVue.css, and fileListContainer in the HTML file
```html
<head>
    <link rel="stylesheet" href="/css/fileVue.css">
</head>
<body>
    <div id="fileListContainer"></div>
    <script src="/js/fileVue.js"></script>
</body>
```
If not configured, default configuration will be used; if configuration is needed, add the following code
```html
<script >
window.addEventListener("DOMContentLoaded", function () {
    fileVue.setConfig({
        showHeader: true,    // Whether to show file list header
        showDate: true,      // Whether to show file date
        showDownload: true,  // Whether to show download link
        initialPath: '/'     // Initial loading directory
    });

    // Custom file type processing
    
    fileVue.handleFileClick = function (item) {
//item structure: {name: 'css', type: 'directory', path: '/css', mtime: '2025-03-31T07:03:34.995Z'}, {name: 'upload.html', type: 'file', path: '/upload.html', mtime: '2025-02-24T11:12:22.265Z'}

        const extension = item.name.split('.').pop().toLowerCase();
        switch (extension) {
            case 'ggb':
                window.open(`/ggb/ggb-editor.html?path=${encodeURIComponent(item.path)}`, '_ggb');
                break;
            default:
                window.open(`${item.path}`, '_blank');
        }
    }
});
</script>
```
## Online Demo
Visit our online demo site: [https://geomath.icu:8080](https://geomath.icu:8080)
## Notes
- **When running fileVue.exe, ensure the port is not occupied.**
- **Since fileVue.exe uses the compression middleware to compress files, the file size may show as unknown during download, but this does not affect the download.**
