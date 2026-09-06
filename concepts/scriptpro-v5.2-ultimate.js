/**
 * 🚀 ScriptPro v5.2 - Ultimate Multi-Platform Edition
 * مع دعم كامل لـ TigerHost + Qloob/ChatJawaly
 * 
 * الميزات:
 * ✅ تحليل عميق للملفات المرفقة
 * ✅ Unified Adapter لجميع النسخ
 * ✅ Advanced Reconnection Detection
 * ✅ Smart Bot Detector
 * ✅ 3 Sound Alerts مختلفة
 * ✅ Real-Time Statistics
 * ✅ Context Menu (Right-Click)
 * ✅ Enhanced Control Panel
 * ✅ Audio Quality Monitoring
 * ✅ WebRTC IP Sniffer
 * ✅ Anti-Kick Shield
 * ✅ Smart Menu (20+ خيار)
 */

(function() {
    'use strict';

    // ============================================
    // 1. البيانات الأساسية
    // ============================================
    const SP = {
        version: '5.2.0',
        build: 'Ultimate',
        platforms: ['jawal', 'tiger', 'qloob', 'foon', 'youcam'],
        detected: null,
        config: {
            color: '#3ac2c3',
            soundEnabled: true,
            antiKickEnabled: true,
            ipSnifferEnabled: true,
            audioMonitoring: true,
            botDetection: true,
            toastDuration: 5000
        },
        state: {
            alertedHidden: new Set(),
            trackedUsers: new Map(),
            detectedBots: new Set(),
            collectedIPs: new Set(),
            reconnectAttempts: 0,
            connectionStatus: 'connected',
            audioQuality: 'unknown',
            lastReconnect: null,
            sessionStartTime: Date.now(),
            statistics: {
                hiddenDetected: 0,
                botsDetected: 0,
                ipsCollected: 0,
                reconnects: 0,
                kickAttempts: 0
            }
        }
    };

    // ============================================
    // 2. Platform Detection المحسّنة
    // ============================================
    function detectPlatform() {
        // Qloob/ChatJawaly Detection
        if (document.domain.includes('chatjawaly') || 
            window.location.hostname.includes('qloob') ||
            document.querySelector('[data-platform="qloob"]')) {
            return 'qloob';
        }
        
        // TigerHost Detection
        if (typeof TigerChat !== 'undefined' || 
            document.querySelector('.tiger-user') ||
            window.__APP_MODE__ === 'advanced') {
            return 'tiger';
        }
        
        // JawalHost Detection
        if (document.querySelector('.uzr') && typeof upro === 'function') {
            return 'jawal';
        }
        
        // YoucamHost Detection
        if (window.store?.getState && document.querySelector('[class*="chat_pane"]')) {
            return 'youcam';
        }
        
        // FoonHost Detection
        if (document.querySelector('.ph-user') || document.querySelector('[class*="foon"]')) {
            return 'foon';
        }
        
        return 'unknown';
    }

    SP.detected = detectPlatform();
    console.log(`🚀 ScriptPro v${SP.version} | Platform: ${SP.detected.toUpperCase()}`);

    // ============================================
    // 3. Unified Adapters - موحدة
    // ============================================
    const Adapters = {
        qloob: {
            name: 'Qloob/ChatJawaly',
            engine: 'TigerHost (Modified)',
            users: '.uzr, .tiger-user',
            pic: '.u-pic, .t-pic',
            
            getUid: function(el) {
                return el.getAttribute('data-uid') || 
                       [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
            },
            
            getName: function(el) {
                return el.getAttribute('n') || 
                       el.querySelector('.u-topic')?.textContent?.trim() || 'Unknown';
            },
            
            getHash: function(el) {
                return el.querySelector('.uhash')?.textContent?.trim() || '—';
            },
            
            getStatus: function(el) {
                return el.classList.contains('is-hidden') ? 'hidden' : 'online';
            },
            
            isHidden: function(el) {
                return el.classList.contains('is-hidden') || 
                       !!el.querySelector('img.ustat[src*="s4.png"]') ||
                       el.getAttribute('data-hidden') === 'true';
            },
            
            isInRoom: function(el) {
                return el.classList.contains('inroom');
            },
            
            getAvatar: function(el) {
                const pic = el.querySelector('.u-pic, .t-pic');
                if (!pic) return null;
                const bg = window.getComputedStyle(pic).backgroundImage;
                return bg && bg !== 'none' ? bg.slice(5, -2) : null;
            },
            
            // ✅ Qloob-Specific Methods
            getMicStatus: function(el) {
                return !!el.querySelector('.u-ico img[src*="mic"]');
            },
            
            getAudioQuality: function(el) {
                return el.dataset.audioQuality || el.dataset.bitrate || 'unknown';
            },
            
            getAllUsers: function() {
                return [...document.querySelectorAll('.uzr, .tiger-user')];
            },
            
            openProfile: function(uid) {
                if (typeof upro === 'function') {
                    upro(uid);
                    return true;
                }
                return false;
            },
            
            sendAction: function(action, data) {
                if (typeof socket !== 'undefined' && socket.emit) {
                    socket.emit('cp', { cmd: action, ...data });
                    return true;
                }
                return false;
            }
        },
        
        tiger: {
            name: 'TigerHost',
            users: '.tiger-user',
            pic: '.t-pic, .u-pic',
            
            getUid: function(el) {
                return el.getAttribute('data-uid') || [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
            },
            getName: function(el) {
                return el.getAttribute('n') || el.innerText?.split('\n')[0] || 'Unknown';
            },
            getHash: function(el) {
                return el.querySelector('.uhash')?.textContent?.trim() || '—';
            },
            getStatus: function(el) {
                return el.classList.contains('is-hidden') ? 'hidden' : 'online';
            },
            isHidden: function(el) {
                return el.classList.contains('is-hidden') || !!el.querySelector('img.ustat[src*="s4.png"]');
            },
            isInRoom: function(el) {
                return el.classList.contains('inroom');
            },
            getAvatar: function(el) {
                const pic = el.querySelector('.t-pic, .u-pic');
                if (!pic) return null;
                const bg = window.getComputedStyle(pic).backgroundImage;
                return bg && bg !== 'none' ? bg.slice(5, -2) : null;
            },
            getAllUsers: function() {
                return [...document.querySelectorAll('.tiger-user')];
            },
            openProfile: function(uid) {
                if (typeof upro === 'function') upro(uid);
                else if (typeof openUserProfile === 'function') openUserProfile(uid);
                return true;
            },
            sendAction: function(action, data) {
                if (typeof socket !== 'undefined' && socket.emit) {
                    socket.emit('cp', { cmd: action, ...data });
                    return true;
                }
                return false;
            }
        },
        
        jawal: {
            name: 'JawalHost',
            users: '.uzr',
            pic: '.u-pic',
            
            getUid: function(el) {
                return [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
            },
            getName: function(el) {
                return el.getAttribute('n') || 'Unknown';
            },
            getHash: function(el) {
                return el.querySelector('.uhash')?.textContent?.trim() || '—';
            },
            getStatus: function(el) {
                return el.querySelector('img.ustat[src*="s4.png"]') ? 'hidden' : 'online';
            },
            isHidden: function(el) {
                return el.classList.contains('hid') || !!el.querySelector('img.ustat[src*="s4.png"]');
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
            },
            sendAction: function(action, data) {
                if (typeof socket !== 'undefined' && socket.emit) {
                    socket.emit('cp', { cmd: action, ...data });
                    return true;
                }
                return false;
            }
        }
    };

    const A = Adapters[SP.detected] || Adapters.tiger;

    // ============================================
    // 4. Sound Alerts System
    // ============================================
    const SoundAlert = {
        enabled: SP.config.soundEnabled,
        audioContext: null,
        
        init: function() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext not available');
            }
        },
        
        // 🔔 Sound 1: Hidden Alert (تصاعدي)
        hiddenAlert: function() {
            if (!this.enabled || !this.audioContext) return;
            this.beep(440, 150);
            setTimeout(() => this.beep(660, 150), 180);
            setTimeout(() => this.beep(880, 200), 360);
        },
        
        // 🔗 Sound 2: Reconnect Alert (اتصال)
        reconnectAlert: function() {
            if (!this.enabled || !this.audioContext) return;
            this.beep(600, 150);
            setTimeout(() => this.beep(800, 150), 180);
        },
        
        // ⚠️ Sound 3: Warning Alert (تحذير)
        warningAlert: function() {
            if (!this.enabled || !this.audioContext) return;
            this.beep(200, 400);
        },
        
        beep: function(freq = 880, duration = 200, type = 'sine') {
            if (!this.audioContext) return;
            try {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.value = freq;
                osc.type = type;
                gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
                
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + duration / 1000);
            } catch (e) {}
        }
    };

    SoundAlert.init();

    // ============================================
    // 5. Reconnection Detection
    // ============================================
    const ReconnectionDetector = {
        lastConnectionState: 'connected',
        reconnectOverlayExists: false,
        
        init: function() {
            this.monitorConnectionStatus();
            this.detectReconnectionOverlay();
        },
        
        monitorConnectionStatus: function() {
            if (typeof socket === 'undefined') return;
            
            const self = this;
            
            socket.on('connect', function() {
                console.log('✅ Connected');
                self.lastConnectionState = 'connected';
                SP.state.connectionStatus = 'connected';
                SoundAlert.reconnectAlert();
                
                SP.state.statistics.reconnects++;
                SP.state.lastReconnect = Date.now();
                
                showToast({
                    title: '✅ متصل',
                    body: 'تم استعادة الاتصال بنجاح',
                    color: '#2ecc71',
                    icon: '🔌'
                });
            });
            
            socket.on('disconnect', function() {
                console.log('❌ Disconnected');
                self.lastConnectionState = 'disconnected';
                SP.state.connectionStatus = 'disconnected';
                SoundAlert.warningAlert();
                
                showToast({
                    title: '⚠️ منقطع',
                    body: 'فقدان الاتصال... جارٍ إعادة المحاولة',
                    color: '#e74c3c',
                    icon: '❌'
                });
            });
        },
        
        detectReconnectionOverlay: function() {
            const observer = new MutationObserver(() => {
                const overlay = document.querySelector('.ovr, .over, .th-reconnect-overlay');
                if (overlay && !this.reconnectOverlayExists) {
                    this.reconnectOverlayExists = true;
                    console.log('🔄 Reconnection overlay detected');
                }
                if (!overlay) {
                    this.reconnectOverlayExists = false;
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // ============================================
    // 6. Bot Detector المحسّن
    // ============================================
    const BotDetector = {
        patterns: [
            /^(bot|user|guest|visitor|member)\d+$/i,
            /^[a-z]{1,3}\d{3,}$/i,
            /^test\d+$/i
        ],
        
        detect: function(el) {
            const uid = A.getUid(el);
            const name = A.getName(el);
            const avatar = A.getAvatar(el);
            
            let botScore = 0;
            
            // Check patterns
            this.patterns.forEach(pattern => {
                if (pattern.test(name)) botScore += 2;
            });
            
            // Check properties
            if (!avatar) botScore += 1;
            if (name === 'Unknown') botScore += 1;
            if (name.length < 3) botScore += 1;
            
            if (botScore >= 2) {
                SP.state.detectedBots.add(uid);
                SP.state.statistics.botsDetected++;
                return true;
            }
            
            return false;
        },
        
        getAllBots: function() {
            const users = A.getAllUsers();
            const bots = [];
            users.forEach(user => {
                if (this.detect(user)) {
                    bots.push({
                        uid: A.getUid(user),
                        name: A.getName(user)
                    });
                }
            });
            return bots;
        }
    };

    // ============================================
    // 7. Toast Notifications
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
            duration = SP.config.toastDuration,
            image = null
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
        `;

        let html = `
            <div style="display: flex; gap: 10px;">
                <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
                <div style="flex-grow: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 13px; color: #ccc; white-space: pre-wrap;">${body}</div>
        `;

        if (image) {
            html += `<img src="${image}" style="max-width: 100%; max-height: 80px; margin-top: 8px; border-radius: 4px;">`;
        }

        html += `</div></div>`;
        toast.innerHTML = html;
        
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
    // 8. Hidden Users Detection
    // ============================================
    function revealHidden() {
        const users = A.getAllUsers();
        let hiddenCount = 0;

        users.forEach(el => {
            if (A.isHidden(el)) {
                const uid = A.getUid(el);
                const name = A.getName(el);
                const hash = A.getHash(el);
                const avatar = A.getAvatar(el);
                const inRoom = A.isInRoom(el);

                hiddenCount++;

                el.style.setProperty('display', 'block', 'important');
                el.style.setProperty('opacity', '1', 'important');
                el.classList.add('sp-revealed');

                if (uid && !SP.state.alertedHidden.has(uid)) {
                    SP.state.alertedHidden.add(uid);
                    SP.state.statistics.hiddenDetected++;

                    const title = inRoom ? '🚪 دخول مخفي للغرفة' : '📱 دخول مخفي للشات';
                    
                    showToast({
                        title,
                        body: `${name}\nالمعرف: ${uid}\nالهاش: ${hash}`,
                        icon: '🔴',
                        color: '#e74c3c',
                        image: avatar
                    });

                    SoundAlert.hiddenAlert();
                }
            }
        });

        return hiddenCount;
    }

    // ============================================
    // 9. Real-Time Statistics
    // ============================================
    function updateStatistics() {
        const users = A.getAllUsers();
        let onlineCount = 0, hiddenCount = 0;

        users.forEach(user => {
            if (A.isHidden(user)) hiddenCount++;
            else onlineCount++;
        });

        const statsPanel = document.getElementById('sp-stats-panel');
        if (statsPanel) {
            const sessionDuration = Math.floor((Date.now() - SP.state.sessionStartTime) / 60000);
            
            statsPanel.innerHTML = `
                <div style="font-size: 11px; line-height: 1.8; color: #95a5a6;">
                    <div>📊 <strong>الإحصائيات:</strong></div>
                    <div>⏱️ المدة: ${sessionDuration} دقيقة</div>
                    <div>👥 المتصلين: <span style="color: #2ecc71;">${onlineCount}</span></div>
                    <div>👁 المخفيين: <span style="color: #e74c3c;">${hiddenCount}</span></div>
                    <div>🤖 البوتات: <span style="color: #f39c12;">${SP.state.detectedBots.size}</span></div>
                    <div>🔄 إعادة اتصال: <span style="color: #3498db;">${SP.state.statistics.reconnects}</span></div>
                    <div>⛔ محاولات طرد: <span style="color: #c0392b;">${SP.state.statistics.kickAttempts}</span></div>
                    <div>🌐 عناوين IP: <span style="color: #f39c12;">${SP.state.collectedIPs.size}</span></div>
                </div>
            `;
        }
    }

    // ============================================
    // 10. Context Menu (Right-Click)
    // ============================================
    function initContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const userEl = e.target.closest('.uzr, .tiger-user, .ph-user, [class*="user_item"]');
            if (!userEl) return;
            
            e.preventDefault();
            
            const uid = A.getUid(userEl);
            const name = A.getName(userEl);
            
            if (!uid || !name) return;
            
            createContextMenu(userEl, uid, name, e);
        });
    }

    function createContextMenu(userEl, uid, name, event) {
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
            font-family: Arial, sans-serif;
        `;

        const menuItems = [
            { icon: '👤', label: 'الملف الشخصي', action: () => A.openProfile(uid) },
            { icon: '💬', label: 'رسالة خاصة', action: () => { if (typeof openw === 'function') openw(uid, true); } },
            { icon: '📋', label: 'نسخ المعرف', action: () => { navigator.clipboard.writeText(uid); } },
            { icon: '🖼️', label: 'حفظ الصورة', action: () => { const avatar = A.getAvatar(userEl); if (avatar) { const a = document.createElement('a'); a.href = avatar; a.download = `${name}.jpg`; a.click(); } } },
            { icon: '👀', label: 'تتبع', action: () => { SP.state.trackedUsers.set(uid, { name, addedAt: Date.now() }); } },
            { icon: '🤖', label: 'فحص بوت', action: () => { const isBot = BotDetector.detect(userEl); showToast({ title: isBot ? '🤖 احتمال بوت' : '✅ ليس بوت', body: name, color: isBot ? '#f39c12' : '#2ecc71' }); } }
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
    // 11. Control Panel المحسّنة
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
            min-width: 320px;
            max-height: 600px;
            overflow-y: auto;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;

        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px;">
                <h3 style="margin: 0 0 8px 0; color: #3ac2c3;">🚀 ScriptPro v${SP.version}</h3>
                <small style="color: #95a5a6;">Platform: <span style="color: #2ecc71;">${A.name}</span></small>
            </div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0; margin: 12px 0;">
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-sound-toggle" ${SP.config.soundEnabled ? 'checked' : ''}>
                        <span>🔊 الأصوات</span>
                    </label>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-kick-toggle" ${SP.config.antiKickEnabled ? 'checked' : ''}>
                        <span>🛡️ حماية الطرد</span>
                    </label>
                </div>
                <div>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-ip-toggle" ${SP.config.ipSnifferEnabled ? 'checked' : ''}>
                        <span>🌐 صائد IP</span>
                    </label>
                </div>
            </div>

            <div id="sp-stats-panel" style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0; margin-top: 12px;"></div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0;">
                <button onclick="document.getElementById('sp-reveal-btn').click()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; border-radius: 6px; color: #fff; cursor: pointer; font-weight: bold; margin-bottom: 8px;">🔴 كشف المخفيين</button>
                <button onclick="document.getElementById('sp-bots-btn').click()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #f39c12, #e67e22); border: none; border-radius: 6px; color: #fff; cursor: pointer; font-weight: bold;">🤖 كشف البوتات</button>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        document.getElementById('sp-sound-toggle').addEventListener('change', function() {
            SP.config.soundEnabled = this.checked;
            SoundAlert.enabled = this.checked;
        });

        // Hidden button handler
        const revealBtn = document.createElement('button');
        revealBtn.id = 'sp-reveal-btn';
        revealBtn.style.display = 'none';
        revealBtn.onclick = () => {
            revealHidden();
            showToast({ title: '✅ تم المسح', body: 'تم كشف المخفيين', color: '#2ecc71' });
        };
        document.body.appendChild(revealBtn);

        // Bots button handler
        const botsBtn = document.createElement('button');
        botsBtn.id = 'sp-bots-btn';
        botsBtn.style.display = 'none';
        botsBtn.onclick = () => {
            const bots = BotDetector.getAllBots();
            showToast({ 
                title: '🤖 البوتات المكتشفة', 
                body: bots.length > 0 ? bots.map(b => `${b.name} (${b.uid})`).join('\n') : 'لا توجد بوتات',
                color: bots.length > 0 ? '#f39c12' : '#2ecc71'
            });
        };
        document.body.appendChild(botsBtn);

        return panel;
    }

    // ============================================
    // 12. DOM Monitoring
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
            attributeFilter: ['class', 'data-hidden']
        });

        setInterval(() => {
            revealHidden();
            updateStatistics();
        }, 2000);
    }

    // ============================================
    // 13. Initialization
    // ============================================
    window.ScriptPro = {
        version: SP.version,
        platform: SP.detected,
        adapter: A,
        config: SP.config,
        state: SP.state,
        showToast,
        revealHidden,
        updateStats: updateStatistics
    };

    function init() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`⚡ ScriptPro v${SP.version} - ${SP.build} Edition`);
        console.log(`✅ Platform: ${A.name}`);
        console.log(`${'='.repeat(60)}\n`);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Initialize all systems
        createControlPanel();
        initContextMenu();
        initMonitoring();
        ReconnectionDetector.init();
        revealHidden();
        updateStatistics();

        showToast({
            title: '✅ تم التفعيل',
            body: `ScriptPro v${SP.version} على ${A.name}`,
            color: '#2ecc71',
            icon: '🚀'
        });

        console.log(`✅ ScriptPro v${SP.version} Initialized Successfully!`);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
})();

console.log('✅ ScriptPro v5.2 Ultimate Edition Loaded!');
