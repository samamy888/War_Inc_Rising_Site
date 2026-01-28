/**
 * 檔案: assets/js/app.js
 * 描述: 讀取 data.json，並根據當前頁面的類型和 ID 進行渲染。
 */

// 網站基礎路徑配置
const IMG_BASE_PATH = '../assets/images/skills/'; // 圖片相對路徑
const JSON_PATH = '../data.json'; // JSON 檔案相對路徑

// 獲取當前頁面類型和 ID
function getPageContext() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment.length > 0);
    
    // 找出頁面類型 (characters, units, buildings, guides, modes)
    const type = segments.length >= 2 ? segments[segments.length - 2] : null;
    
    let id = null;
    if (type === 'characters') {
        // 從文件名獲取 ID (e.g., flame_sovereign.html -> flame_sovereign)
        const filename = segments[segments.length - 1];
        id = filename.substring(0, filename.lastIndexOf('.'));
    } else if (type && segments[segments.length - 1].includes('index.html')) {
        // 單位/建築/模式的主頁，ID 默認使用該類型的第一個項目 ID 作為數據源
        id = segments[segments.length - 2]; 
    } else if (type === 'guides') {
        // 攻略頁面，使用文件名作為 ID
        const filename = segments[segments.length - 1];
        id = filename.substring(0, filename.lastIndexOf('.'));
    }

    return { type, id };
}

// 獲取數據
async function fetchData() {
    try {
        // 嘗試從相對於 JS 檔案的路徑載入 JSON
        const response = await fetch(JSON_PATH); 
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("無法載入數據:", error);
        // 如果載入失敗，我們不修改 DOM，讓 HTML 保持原樣，避免破壞結構
        return null;
    }
}

// 渲染單個項目 (通用數據表格)
function renderDetailItem(item, type) {
    let detailsHtml = '';
    
    // 渲染基礎屬性/狀態 (Stats)
    if (item.stats) { 
        const statsTable = item.stats.map(stat => 
            `<tr><th>${stat.label}</th><td>${stat.value}</td></tr>`
        ).join('');
        detailsHtml += `
            <h2>🛡️ 基礎屬性</h2>
            <div class="stats-table">
                <table>${statsTable}</table>
            </div>
        `;
    }
    
    // 渲染成本/費用 (Cost)
    if (item.cost) { 
        detailsHtml += `
            <h2>💰 建造費用</h2>
            <p>${item.cost}</p>
        `;
    }

    // 渲染規則 (Rules)
    if (item.rules) { 
        const rulesList = item.rules.map(rule => `<li>${rule}</li>`).join('');
        detailsHtml += `
            <h2>📝 玩法規則</h2>
            <ul>${rulesList}</ul>
        `;
    }

    // 渲染詳細說明 (Details)
    if (item.details) {
        const detailsList = item.details.map(detail => `<li>${detail}</li>`).join('');
        detailsHtml += `
            <h2>📘 詳細說明</h2>
            <ul>${detailsList}</ul>
        `;
    }

    // 渲染攻略分段 (Sections)
    if (item.sections) { 
        detailsHtml += `<h2>${item.name_zh}：${item.content}</h2>`;
        item.sections.forEach(section => {
            detailsHtml += `
                <h3>${section.title}</h3>
                <p>${section.text}</p>
            `;
        });
    }

    // 組合頁面頂部
    const mainTitle = item.name_en ? `${item.name_zh} (${item.name_en})` : item.name_zh;
    const roleOrDesc = item.role || item.description;

    // 根據頁面類型添加圖示
    let icon = '';
    if (type === 'characters') icon = '🐉';
    else if (type === 'units') icon = '🛡️';
    else if (type === 'buildings') icon = '🏛️';
    else if (type === 'modes') icon = '🎮';
    else if (type === 'guides') icon = '📚';

    const outputHtml = `
        <h1 id="item-title">${icon} ${mainTitle}</h1>
        <p class="note" style="text-align: center; color: #cc0000; font-weight: bold;">${roleOrDesc}</p>
        
        ${item.main_image || item.icon ? `<div class="image-container"><img src="${IMG_BASE_PATH}${item.main_image || item.icon}" alt="${item.name_zh}主視覺"></div>` : ''}
        
        <hr>
        
        ${detailsHtml}
        
        ${item.skills ? renderSkills(item.skills) : ''}
        ${item.tactics ? renderTactics(item.tactics) : ''}
    `;
    
    // 尋找內容區域並渲染
    const contentArea = document.getElementById('main-content-area');
    if (contentArea) {
        contentArea.innerHTML = outputHtml;
    }
    
    // 設置 HTML 標題
    document.title = `War Inc Rising - ${item.name_zh || item.id}`;
}

// 渲染技能列表 (僅用於 Characters)
function renderSkills(skills) {
    let html = '<h2>🔥 技能一覽 (Skill Overview)</h2>';
    html += skills.map(skill => {
        const detailsTable = skill.details.map(detail => 
            `<tr><th>${detail.label}</th><td>${detail.value}</td></tr>`
        ).join('');
        
        return `
            <div class="skill-section">
                <div class="skill-info">
                    <div class="skill-detail">
                        <h3>${skill.name_zh} (${skill.name_en}) - [${skill.type}]</h3>
                        <p>**效果:** ${skill.effect}</p>
                        <table>${detailsTable}</table>
                    </div>
                </div>
                <div class="skill-screenshot">
                    <img src="${IMG_BASE_PATH}${skill.icon}" alt="${skill.name_zh}技能截圖">
                </div>
            </div>
        `;
    }).join('');
    return html;
}

// 渲染戰術建議 (僅用於 Characters)
function renderTactics(tactics) {
    let html = '<h2>💡 戰術定位與建議 (Tactical Analysis)</h2>';
    const tacticsList = tactics.map(tip => `<li>${tip}</li>`).join('');
    html += `<p>核心戰術建議如下：</p><ul>${tacticsList}</ul>`;
    return html;
}

// 網站啟動主函數
async function initPage() {
    const { type, id } = getPageContext();
    
    // 首頁 (index.html) 不需要載入資料，所以直接退出
    if (!type) return; 
    
    const data = await fetchData();
    if (!data || !data[type] || data[type].length === 0) return;
    
    let itemData = null;
    
    if (type === 'characters' || type === 'guides') {
        // 角色/攻略頁面：根據 URL 中的 ID 查找
        itemData = data[type].find(item => item.id === id);
    } else {
        // 單位/建築/模式的子頁面：如果沒有 ID，則默認顯示數組中的第一個項目數據
        itemData = data[type][0];
    }

    if (itemData) {
        renderDetailItem(itemData, type);
    } else {
        const contentArea = document.getElementById('main-content-area');
        if (contentArea) {
            contentArea.innerHTML = `<p class="note" style="text-align: center;">找不到對應的資料！</p>`;
        }
    }
}

// 頁面載入完成後執行主函數
document.addEventListener('DOMContentLoaded', initPage);