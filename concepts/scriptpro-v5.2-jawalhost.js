/**
 * 🚀 ScriptPro v5.2 - JawalHost Optimized Edition
 * نسخة محسّنة خصيصاً لـ JawalHost (NJD.chat)
 * 
 * المميزات:
 * ✅ ينتظر Socket.IO بذكاء
 * ✅ لا يتعلق المتصفح
 * ✅ تحميل تدريجي
 * ✅ معالجة الأخطاء الذكية
 */

(function() {
    'use strict';

    const SP = {
        version: '5.2.0',
        platform: 'jawal',
        edition: 'JawalHost Optimized',
        config: {
            soundEnabled: true,
            antiKickEnabled: true,
            toastDuration: 5000
        },
        state: {
            alertedHidden: new Set(),
            trackedUsers: new Map(),
            detectedBots: new Set(),
            socketLoaded: false,
            initialized: false,
            statistics: {
                hiddenDetected: 0,
                botsDetected: 0,
                reconnects: 0
            }
        }
    };

    console.log(`🚀 ScriptPro v${SP.version} - ${SP.edition} Starting...`);

    // ============================================
    // 1. JawalHost Adapter
    // ============================================
    const JawalAdapter = {
        name: 'JawalHost',
        users: '.uzr',
        
        getUid: function(el) {
            return [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
        },
        
        getName: function(el) {
            return el.getAttribute('n') || 'Unknown';
        },
        
        getHash: function(el) {
            return el.querySelector('.uhash')?.textContent?.trim() || '—';
        },
        
        isHidden: function(el) {
            return el.classList.contains('hid') || 
                   !!el.querySelector('img.ustat[src*="s4.png"]');
        },
        
        isInRoom: function(el) {
            return el.classList.contains('inroom');
        },
        
        getAvatar: function(el) {
            const pic = el.querySelector('.u-pic');
            if (!pic) return null;
            const bg = window.getComputedStyle(pic).backgroundImage;
            return bg && bg !== 'none' ? bg.slice(5, -2) : null;
        },
        
        getAllUsers: function() {
            return [...document.querySelectorAll('.uzr')];
        },
        
        openProfile: function(uid) {
            if (typeof upro === 'function') {
                upro(uid);
                return true;
            }
            return false;
        }
    };

    // ============================================
    // 2. Socket.IO Waiter
    // ============================================
    const SocketWaiter = {
        maxWaitTime: 30000, // 30 ثانية
        checkInterval: 500, // 500ms
        startTime: Date.now(),
        
        wait: function(callback) {
            console.log('⏳ Waiting for Socket.IO...');
            
            const checkSocket = () => {
                if (typeof socket !== 'undefined') {
                    console.log('✅ Socket.IO Found!');
                    SP.state.socketLoaded = true;
                    callback(true);
                    return;
                }
                
                const elapsed = Date.now() - this.startTime;
                if (elapsed > this.maxWaitTime) {
                    console.warn('⚠️ Socket.IO timeout after 30s - Initializing anyway');
                    callback(false);
                    return;
                }
                
                setTimeout(checkSocket, this.checkInterval);
            };
            
            checkSocket();
        }
    };

    // ============================================
    // 3. Toast Notifications
    // ============================================
    function createToastContainer() {
        let container = document.getElementById('sp-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sp-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                z-index: 999999;
                max-width: 400px;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(config) {
        const {
            title = '📢',
            body = '',
            icon = '📢',
            color = '#3498db',
            duration = SP.config.toastDuration
        } = config;

        const container = createToastContainer();
        const toast = document.createElement('div');
        
        toast.style.cssText = `
            background: linear-gradient(135deg, ${color}15 0%, ${color}08 100%);
            border-right: 4px solid ${color};
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            color: #fff;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
            direction: rtl;
        `;

        toast.innerHTML = `
            <div style="display: flex; gap: 10px;">
                <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
                <div style="flex-grow: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 13px; color: #ccc; white-space: pre-wrap;">${body}</div>
                </div>
            </div>
        `;
        
        toast.onclick = () => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        };
        
        container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }

        return toast;
    }

    // ============================================
    // 4. Hidden Users Detection
    // ============================================
    function revealHidden() {
        const users = JawalAdapter.getAllUsers();
        let hiddenCount = 0;

        users.forEach(el => {
            if (JawalAdapter.isHidden(el)) {
                const uid = JawalAdapter.getUid(el);
                const name = JawalAdapter.getName(el);
                const hash = JawalAdapter.getHash(el);
                const avatar = JawalAdapter.getAvatar(el);

                hiddenCount++;

                el.style.setProperty('display', 'block', 'important');
                el.style.setProperty('opacity', '1', 'important');
                el.classList.add('sp-revealed');

                if (uid && !SP.state.alertedHidden.has(uid)) {
                    SP.state.alertedHidden.add(uid);
                    SP.state.statistics.hiddenDetected++;

                    showToast({
                        title: '👁 مستخدم مخفي',
                        body: `${name}\nالمعرف: ${uid}\nالهاش: ${hash}`,
                        icon: '🔴',
                        color: '#e74c3c'
                    });

                    // Sound alert
                    if (SP.config.soundEnabled) {
                        soundAlert();
                    }
                }
            }
        });

        return hiddenCount;
    }

    // ============================================
    // 5. Sound Alert
    // ============================================
    function soundAlert() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            const beep = (freq, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + duration / 1000);
            };
            
            beep(440, 150);
            setTimeout(() => beep(660, 150), 180);
            setTimeout(() => beep(880, 200), 360);
        } catch (e) {
            // Silent fail
        }
    }

    // ============================================
    // 6. Control Panel
    // ============================================
    function createControlPanel() {
        let panel = document.getElementById('sp-control-panel');
        if (panel) return panel;

        panel = document.createElement('div');
        panel.id = 'sp-control-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999997;
            background: rgba(13, 21, 40, 0.98);
            border: 1px solid rgba(52, 179, 195, 0.3);
            border-radius: 12px;
            padding: 16px;
            font-family: Arial, sans-serif;
            color: #fff;
            min-width: 300px;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            direction: rtl;
        `;

        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px;">
                <h3 style="margin: 0 0 8px 0; color: #3ac2c3;">🚀 ScriptPro v${SP.version}</h3>
                <small style="color: #95a5a6;">JawalHost Edition</small>
            </div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0; margin: 12px 0;">
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-sound-toggle" ${SP.config.soundEnabled ? 'checked' : ''}>
                        <span>🔊 الأصوات</span>
                    </label>
                </div>
            </div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0;">
                <button id="sp-reveal-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                ">🔴 كشف المخفيين</button>
            </div>

            <div id="sp-stats-panel" style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0; margin-top: 12px; font-size: 12px; color: #95a5a6; line-height: 1.8;"></div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        document.getElementById('sp-sound-toggle').addEventListener('change', function() {
            SP.config.soundEnabled = this.checked;
        });

        document.getElementById('sp-reveal-btn').addEventListener('click', function() {
            const count = revealHidden();
            showToast({
                title: '✅ تم المسح',
                body: `تم كشف ${count} مستخدم مخفي`,
                color: '#2ecc71'
            });
        });

        return panel;
    }

    // ============================================
    // 7. Statistics Update
    // ============================================
    function updateStatistics() {
        const users = JawalAdapter.getAllUsers();
        let hiddenCount = 0;

        users.forEach(user => {
            if (JawalAdapter.isHidden(user)) hiddenCount++;
        });

        const statsPanel = document.getElementById('sp-stats-panel');
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div>👥 المتصلين: ${users.length}</div>
                <div>👁 المخفيين: <span style="color: #e74c3c;">${hiddenCount}</span></div>
                <div>📊 المكتشفة: <span style="color: #2ecc71;">${SP.state.statistics.hiddenDetected}</span></div>
                <div>🔌 Socket: <span style="color: ${SP.state.socketLoaded ? '#2ecc71' : '#f39c12'};\">${SP.state.socketLoaded ? '✅ متصل' : '⏳ جاري'}</span></div>
            `;
        }
    }

    // ============================================
    // 8. Context Menu
    // ============================================
    function initContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const userEl = e.target.closest('.uzr');
            if (!userEl) return;
            
            e.preventDefault();
            
            const uid = JawalAdapter.getUid(userEl);
            const name = JawalAdapter.getName(userEl);
            
            if (!uid || !name) return;
            
            showContextMenu(userEl, uid, name, e);
        });
    }

    function showContextMenu(userEl, uid, name, event) {
        let menu = document.getElementById('sp-context-menu');
        if (menu) menu.remove();

        menu = document.createElement('div');
        menu.id = 'sp-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${event.pageX}px;
            top: ${event.pageY}px;
            z-index: 9999999;
            background: rgba(13, 21, 40, 0.98);
            border: 1px solid rgba(52, 179, 195, 0.5);
            border-radius: 8px;
            padding: 0;
            min-width: 200px;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            color: #fff;
        `;

        const menuItems = [
            { 
                icon: '👤', 
                label: 'فتح الملف الشخصي', 
                action: () => JawalAdapter.openProfile(uid)
            },
            { 
                icon: '💬', 
                label: 'رسالة خاصة', 
                action: () => { if (typeof openw === 'function') openw(uid, true); }
            },
            { 
                icon: '📋', 
                label: 'نسخ المعرف', 
                action: () => { navigator.clipboard.writeText(uid); showToast({ title: '✅ تم النسخ', body: uid, color: '#2ecc71' }); }
            }
        ];

        menuItems.forEach((item, index) => {
            const btn = document.createElement('div');
            btn.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                border-bottom: 1px solid rgba(52, 179, 195, 0.2);
                transition: all 0.2s;
            `;
            btn.innerHTML = `<span style="font-size: 16px;">${item.icon}</span><span>${item.label}</span>`;
            
            btn.onmouseover = () => btn.style.background = 'rgba(52, 179, 195, 0.2)';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = () => { item.action(); menu.remove(); };
            
            if (index === menuItems.length - 1) btn.style.borderBottom = 'none';
            
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);
        document.addEventListener('click', () => menu.remove(), { once: true });
    }

    // ============================================
    // 9. DOM Monitoring
    // ============================================
    function initMonitoring() {
        const observer = new MutationObserver(() => {
            revealHidden();
            updateStatistics();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Periodic update
        setInterval(() => {
            revealHidden();
            updateStatistics();
        }, 2000);
    }

    // ============================================
    // 10. Main Initialization
    // ============================================
    function init() {
        if (SP.state.initialized) return;
        SP.state.initialized = true;

        console.log(`✅ ScriptPro v${SP.version} Initializing...`);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Initialize systems
        createControlPanel();
        initContextMenu();
        initMonitoring();
        revealHidden();
        updateStatistics();

        showToast({
            title: '✅ تم التفعيل',
            body: `ScriptPro v${SP.version}\nعلى JawalHost`,
            color: '#2ecc71',
            icon: '🚀'
        });

        console.log(`✅ ScriptPro v${SP.version} Ready!`);
        console.log(`   Users: ${JawalAdapter.getAllUsers().length}`);
        console.log(`   Hidden: ${JawalAdapter.getAllUsers().filter(u => JawalAdapter.isHidden(u)).length}`);

        // Make API available
        window.ScriptPro = {
            version: SP.version,
            platform: SP.platform,
            adapter: JawalAdapter,
            revealHidden,
            showToast
        };
    }

    // ============================================
    // 11. Smart Initialization Flow
    // ============================================
    SocketWaiter.wait(() => {
        init();
    });

    // Fallback: Initialize even if Socket.IO doesn't load
    setTimeout(() => {
        if (!SP.state.initialized) {
            console.warn('⚠️ Forcing initialization (Socket.IO not loaded)');
            init();
        }
    }, 35000);

})();

console.log('✅ ScriptPro v5.2 JawalHost Edition Loaded Successfully!');
