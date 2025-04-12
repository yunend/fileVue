class FileVue {
    // 处理文件点击
    handleFileClick(item) {
        // 获取文件扩展名
        const extension = item.name.split('.').pop().toLowerCase();

        // 根据文件类型处理
        switch (extension) {
            case 'ggb':
                // 将路径中的反斜杠替换为正斜杠
                //const normalizedPath = item.path.replace(/\\/g, '/');
                // 打开ggb编辑器页面
                //alert(normalizedPath);
                window.open(`/ggb/ggbVue.html?path=${encodeURIComponent(item.path)}`, '_ggb');
                break;
            // 可以继续添加其他文件类型的处理
            default:
                // 默认处理方式：打开文件链接
                window.open(`${item.path}`, '_blank');
            // window.location.href = `/${item.path}`;
        }
    }
    constructor() {
        this.currentPath = '/';
        this.sortState = {
            byName: 'asc', // 修改：初始值为'asc'，表示默认按名称升序排列
            byDate: null  // 修改：初始值为null
        };
        // 添加配置选项
        this.config = {
            showHeader: true,    // 是否显示fileListHeader
            showDate: true,      // 是否显示文件日期
            showDownload: true,   // 是否显示“下载”链接
            initialPath: '/'     // 初始化时加载的目录
        };
    }

    // 初始化文件浏览器
    init() {
        // 加载初始目录
        if (this.config.initialPath) {
            this.currentPath = this.config.initialPath;
        }
        this.loadDirectory(this.currentPath);
    }

    // 加载指定目录
    async loadDirectory(path) {
        try {
            // 确保路径以斜杠开头
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            const response = await fetch(`/list:${normalizedPath}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
			this.currentPath=path;
            // 对data数组中的每个对象的path进行处理
            const processedData = data.map(item => {
                if (item.path) {
                    item.path = item.path.replace(/\\/g, '/');
                    // 确保路径以斜杠开头
                    item.path = item.path.startsWith('/') ? item.path : `/${item.path}`;
                }
                // console.log(item);
                return item;
            });

            this.renderFileList(processedData);
        } catch (error) {
            console.error('Error loading directory:', error);
        }
    }
    // 渲染文件列表
    renderFileList(items) {
        const fileListContainer = document.getElementById('fileListContainer');

        // 清空容器
        fileListContainer.innerHTML = '';

        // 创建 fileListHeader
        const fileListHeader = document.createElement('div');
        fileListHeader.id = 'fileListHeader';
        fileListContainer.appendChild(fileListHeader);

        // 根据配置决定是否显示fileListHeader
        if (!this.config.showHeader) {
            fileListHeader.style.display = 'none';
        }
        // 创建 fileList
        const fileList = document.createElement('ul');
        fileList.id = 'fileList';
        fileList.className = 'list-unstyled';
        fileListContainer.appendChild(fileList);

        // 显示当前路径和排序按钮
        const pathParts = this.currentPath.split('/').filter(Boolean);
        let currentPath = '';
        fileListHeader.innerHTML = `
            <div class="fv-header-content">
                <h4 class="fv-list-item">
                    <span class="fv-path-link" onclick="fileVue.loadDirectory('/')">🏠/</span>
                    ${pathParts.map((part, index) => {
            currentPath += `/${part}`;
            return `<span class="fv-path-link" onclick="fileVue.loadDirectory('${currentPath}')">${decodeURIComponent(part)}</span> /`;
        }).join('')}
                </h4>
                <div class="fv-sort-buttons">
                    <button class="fv-sort-btn" onclick="fileVue.handleSortClick('name')">
                        文件名 ${this.sortState.byName !== null ? (this.sortState.byName === 'asc' ? '▲' : '▼') : ''}
                    </button>
                    <button class="fv-sort-btn" onclick="fileVue.handleSortClick('date')">
                        修改时间 ${this.sortState.byDate !== null ? (this.sortState.byDate === 'asc' ? '▲' : '▼') : ''}
                    </button>
                </div>
            </div>
        `;
        // 先按类型排序（文件夹在前），再按当前排序状态排序
        const sortedItems = items.slice()
            .sort((a, b) => {
                // 首先按类型排序，文件夹在前
                if (a.type === 'directory' && b.type !== 'directory') return -1;
                if (a.type !== 'directory' && b.type === 'directory') return 1;

                // 然后按当前激活的排序状态排序
                if (this.sortState.byName !== null) {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    return this.sortState.byName === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                } else if (this.sortState.byDate !== null) {
                    const dateA = new Date(a.mtime);
                    const dateB = new Date(b.mtime);
                    return this.sortState.byDate === 'asc' ? dateA - dateB : dateB - dateA;
                }
                return 0;
            });
        // 添加返回上级目录按钮（如果不是根目录）
        if (this.currentPath !== '/') {
            const backItem = document.createElement('li');
            backItem.className = 'fv-item';
            backItem.innerHTML = '<span class="fv-name">📁 ..</span>';
            backItem.onclick = () => this.navigateUp();
            fileList.appendChild(backItem);
        }

        // 渲染每个项目
        sortedItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'fv-item';

            // 根据配置决定是否显示日期
            const modifiedTime = this.config.showDate ?
                `<span class="fv-secondary-text">${new Date(item.mtime).toLocaleString()}</span>` : '';

            if (item.type === 'directory') {
                listItem.innerHTML = `
                    <span class="fv-name">📁 ${item.name}</span>
                    ${modifiedTime}
                `;
                listItem.onclick = () => this.handleFolderClick(item);


            } else {
                // 根据配置决定是否显示下载链接
                const downloadLink = this.config.showDownload ?
                    `<a href="${item.path}" download class="fv-download-link" onclick="event.stopPropagation()">下载</a>` : '';

                listItem.innerHTML = `
                    <span class="fv-name">📄 ${item.name}</span>
                    ${modifiedTime}
                    ${downloadLink}
                `;
                listItem.onclick = () => this.handleFileClick(item);
            }

            fileList.appendChild(listItem);
        });
    }


    // 处理文件夹点击
    handleFolderClick(item) {
		
        
        this.loadDirectory( item.path);
    }
    // 导航到上一级目录
    navigateUp() {
        //this.currentPath = this.currentPath.replace(/\\/g, '/').split('/').filter(Boolean);
        const parts = this.currentPath.split('/').filter(Boolean);
        if (parts.length > 1) {
            parts.pop();
            this.currentPath = '/' + parts.join('/');
        } else {
            this.currentPath = '/';
        }
        this.loadDirectory(this.currentPath);
    }


    // 排序方法
    sortItems(items, sortBy, order) {
        return items.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            } else if (sortBy === 'date') {
                const dateA = new Date(a.mtime);
                const dateB = new Date(b.mtime);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });
    }

    // 处理排序按钮点击
    handleSortClick(sortBy) {
        if (sortBy === 'name') {
            this.sortState.byName = this.sortState.byName === 'asc' ? 'desc' : 'asc';
            this.sortState.byDate = null; // 重置日期排序状态
        } else if (sortBy === 'date') {
            this.sortState.byDate = this.sortState.byDate === 'asc' ? 'desc' : 'asc';
            this.sortState.byName = null; // 重置名称排序状态
        }
        this.loadDirectory(this.currentPath);
    }
    // 添加配置方法
    setConfig(config) {
        this.config = { ...this.config, ...config };
        
    }
    
}

// 初始化文件浏览器
window.fileVue = new FileVue();
window.onload = () => window.fileVue.init();