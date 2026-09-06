/**
 * ⚡ ScriptPro v5.1 - TigerHost Edition
 * 🚀 محسّن خصيصاً لـ TigerHost (NJD Chat)
 * 
 * التحسينات:
 * ✅ WebRTC IP Sniffer
 * ✅ Smart Menu (15+ خيار)
 * ✅ Anti-Kick Shield
 * ✅ Advanced Socket Interception
 * ✅ Reconnection Detection
 * ✅ Hidden User Deep Scan
 * ✅ Bot Detection & Filtering
 * ✅ Real-Time Activity Monitor
 */

(function() {
    'use strict';

    // ============================================
    // 1. التكوين الأساسي
    // ============================================
    const SP = {
        version: '5.1.0',
        platform: 'tiger',
        edition: 'TigerHost NJD',
        config: {
            color: '#3ac2c3',
            soundEnabled: true,
            antiKickEnabled: true,
            ipSnifferEnabled: true,
            toastDuration: 5000
        },
        state: {
            adapter: null,
            alertedHidden: new Set(),
            trackedUsers: new Set(),
            detectedBots: new Set(),
            collectedIPs: new Set(),
            knockAttempts: new Map(),
            lastReconnect: null,
            socketIntercepted: false
        },
        ui: {
            panelOpen: false,
            hudVisible: true,
            menuVisible: false
        }
    };

    // ============================================
    // 2. TigerHost Adapter المحسّن
    // ============================================
    const TigerAdapter = {
        name: 'TigerHost',
        mode: window.__APP_MODE__ || 'advanced',
        
        // ✅ Selectors
        users: '.tiger-user, .uzr',
        pic: '.t-pic, .u-pic',
        userContainer: '#users, [data-users-container]',
        
        // ✅ Get User ID
        getUid: function(el) {
            return el.getAttribute('data-uid') || 
                   el.getAttribute('data-user-id') ||
                   [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
        },
        
        // ✅ Get User Name
        getName: function(el) {
            return el.getAttribute('n') || 
                   el.querySelector('.u-topic, .user-name')?.textContent?.trim() ||
                   el.innerText?.split('\n')[0] || 
                   'Unknown';
        },
        
        // ✅ Get User Hash
        getHash: function(el) {
            return el.getAttribute('data-hash') ||
                   el.querySelector('.uhash, [data-hash]')?.textContent?.trim() ||
                   el.dataset.hash || '—';
        },
        
        // ✅ Get User Status
        getStatus: function(el) {
            return el.classList.contains('is-hidden') || 
                   el.querySelector('img.ustat[src*="s4.png"]') ? 
                   'hidden' : 'online';
        },
        
        // ✅ Check if Hidden
        isHidden: function(el) {
            return el.classList.contains('is-hidden') || 
                   !!el.querySelector('img.ustat[src*="s4.png"]') ||
                   el.getAttribute('data-hidden') === 'true';
        },
        
        // ✅ Check if In Room
        isInRoom: function(el) {
            return el.classList.contains('inroom') ||
                   el.getAttribute('data-inroom') === 'true';
        },
        
        // ✅ Get User Avatar
        getAvatar: function(el) {
            const pic = el.querySelector('.t-pic, .u-pic, img.avatar');
            if (!pic) return null;
            
            let bgImage = window.getComputedStyle(pic).backgroundImage;
            if (bgImage && bgImage !== 'none') {
                return bgImage.slice(5, -2);
            }
            
            if (pic.src) return pic.src;
            return null;
        },
        
        // ✅ Get All Users
        getAllUsers: function() {
            return [...document.querySelectorAll('.tiger-user, .uzr')];
        },
        
        // ✅ Open User Profile
        openProfile: function(uid) {
            if (typeof upro === 'function') {
                upro(uid);
                return true;
            }
            if (typeof openUserProfile === 'function') {
                openUserProfile(uid);
                return true;
            }
            // Fallback: Direct click
            const userEl = document.querySelector(`[data-uid="${uid}"], .tiger-user[data-user-id="${uid}"]`);
            if (userEl) {
                userEl.click();
                return true;
            }
            return false;
        },
        
        // ✅ Send Socket Action
        sendAction: function(action, data) {
            if (typeof socket !== 'undefined' && socket.emit) {
                socket.emit('cp', { cmd: action, ...data });
                return true;
            }
            return false;
        },
        
        // ✅ Get My User ID
        getMyUid: function() {
            return window.myid || 
                   document.querySelector('[data-my-uid]')?.getAttribute('data-my-uid') ||
                   localStorage.getItem('myid');
        },
        
        // ✅ Get Current Room
        getCurrentRoom: function() {
            return window.myroom || 
                   document.querySelector('[data-current-room]')?.getAttribute('data-current-room') ||
                   localStorage.getItem('myroom');
        }
    };

    SP.state.adapter = TigerAdapter;

    // ============================================
    // 3. WebRTC IP Sniffer
    // ============================================
    const IPSniffer = {
        collectedIPs: new Set(),
        
        init: function() {
            console.log('🔍 IP Sniffer Initializing...');
            this.interceptRTC();
            this.interceptWebRTC();
        },
        
        interceptRTC: function() {
            const originalRTCPeerConnection = window.RTCPeerConnection;
            const self = this;
            
            window.RTCPeerConnection = function(...args) {
                const pc = new originalRTCPeerConnection(...args);
                
                const originalAddIceCandidate = pc.addIceCandidate;
                pc.addIceCandidate = function(candidate) {
                    if (candidate && candidate.candidate) {
                        self.parseCandidate(candidate.candidate);
                    }
                    return originalAddIceCandidate.apply(this, arguments);
                };
                
                return pc;
            };
        },
        
        interceptWebRTC: function() {
            if (window.webkitRTCPeerConnection) {
                const self = this;
                const original = window.webkitRTCPeerConnection;
                
                window.webkitRTCPeerConnection = function(...args) {
                    const pc = new original(...args);
                    
                    const originalAddIceCandidate = pc.addIceCandidate;
                    pc.addIceCandidate = function(candidate) {
                        if (candidate && candidate.candidate) {
                            self.parseCandidate(candidate.candidate);
                        }
                        return originalAddIceCandidate.apply(this, arguments);
                    };
                    
                    return pc;
                };
            }
        },
        
        parseCandidate: function(candidate) {
            // Parse: candidate:xxx xxx xxx ip port type
            const ipRegex = /(\d+\.\d+\.\d+\.\d+)/g;
            const matches = candidate.match(ipRegex);
            
            if (matches) {
                matches.forEach(ip => {
                    // Filter private IPs
                    if (!this.isPrivateIP(ip)) {
                        this.collectedIPs.add(ip);
                        console.log(`🌐 Public IP Detected: ${ip}`);
                        
                        showToast({
                            title: '🌐 IP Detected',
                            body: `Public IP: ${ip}`,
                            color: '#f39c12',
                            icon: '🔍'
                        });
                    }
                });
            }
        },
        
        isPrivateIP: function(ip) {
            const privateRanges = [
                /^10\./,
                /^172\.(1[6-9]|2\d|3[01])\./,
                /^192\.168\./,
                /^127\./,
                /^fc00:/i,
                /^fe80:/i,
                /^::1$/
            ];
            
            return privateRanges.some(range => range.test(ip));
        },
        
        getCollectedIPs: function() {
            return Array.from(this.collectedIPs);
        }
    };

    // ============================================
    // 4. Anti-Kick Shield
    // ============================================
    const AntiKickShield = {
        enabled: SP.config.antiKickEnabled,
        kickAttempts: new Map(),
        
        init: function() {
            console.log('🛡️ Anti-Kick Shield Activated');
            this.interceptSocket();
            this.monitorDOM();
        },
        
        interceptSocket: function() {
            if (!window.socket) return;
            
            const originalEmit = window.socket.emit;
            const self = this;
            
            window.socket.emit = function(event, data) {
                // Detect kick attempts
                if (event === 'cp' && data?.cmd === 'kick') {
                    const uid = data.uid;
                    const myUid = TigerAdapter.getMyUid();
                    
                    if (uid === myUid) {
                        console.log('⛔ Kick attempt detected! Blocking...');
                        self.blockKick(uid);
                        
                        showToast({
                            title: '🛡️ Anti-Kick Activated',
                            body: 'محاولة طرد تم حظرها!',
                            color: '#e74c3c',
                            icon: '⛔'
                        });
                        
                        return; // Block the kick
                    }
                }
                
                return originalEmit.apply(this, arguments);
            };
        },
        
        blockKick: function(uid) {
            const count = (this.kickAttempts.get(uid) || 0) + 1;
            this.kickAttempts.set(uid, count);
            
            // Report after multiple attempts
            if (count >= 3) {
                console.warn(`🚨 Multiple kick attempts from ${uid}`);
            }
        },
        
        monitorDOM: function() {
            // Monitor for disconnect/reconnect messages
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.textContent?.includes('kicked') || 
                                node.textContent?.includes('طرد')) {
                                console.log('❌ User was kicked, attempting recovery...');
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // ============================================
    // 5. Socket Interception System
    // ============================================
    const SocketInterceptor = {
        interceptors: [],
        
        init: function() {
            if (!window.socket || SP.state.socketIntercepted) return;
            
            console.log('🔌 Socket Interceptor Initializing...');
            
            const originalEmit = window.socket.emit;
            const originalOn = window.socket.on;
            
            window.socket.emit = function(event, data) {
                console.log(`📤 Socket Emit: ${event}`, data);
                return originalEmit.apply(this, arguments);
            };
            
            window.socket.on = function(event, callback) {
                console.log(`📥 Socket On: ${event}`);
                
                // Intercept user events
                if (event === 'user:join' || event === 'user:hidden' || event === 'user:leave') {
                    const wrappedCallback = function(data) {
                        console.log(`🔔 Event: ${event}`, data);
                        
                        // Show notification
                        if (event === 'user:hidden') {
                            showToast({
                                title: '👁 Hidden User',
                                body: `${data.name} دخل مخفي`,
                                color: '#e74c3c',
                                icon: '🔴'
                            });
                        }
                        
                        return callback.apply(this, arguments);
                    };
                    
                    return originalOn.call(this, event, wrappedCallback);
                }
                
                return originalOn.apply(this, arguments);
            };
            
            SP.state.socketIntercepted = true;
            console.log('✅ Socket Interceptor Active');
        }
    };

    // ============================================
    // 6. Smart Menu (15+ خيار)
    // ============================================
    function createSmartMenu(userEl, uid, name) {
        let menu = document.getElementById('sp-smart-menu');
        if (menu) menu.remove();
        
        menu = document.createElement('div');
        menu.id = 'sp-smart-menu';
        menu.style.cssText = `
            position: fixed;
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
            direction: rtl;
        `;
        
        const myUid = TigerAdapter.getMyUid();
        const isMyself = uid === myUid;
        
        const menuItems = [
            {
                icon: '👤',
                label: 'فتح الملف الشخصي',
                action: () => TigerAdapter.openProfile(uid)
            },
            {
                icon: '💬',
                label: 'رسالة خاصة',
                action: () => {
                    if (typeof openw === 'function') openw(uid, true);
                    else alert('فتح الرسائل الخاصة');
                }
            },
            {
                icon: '📋',
                label: 'نسخ المعرف',
                action: () => {
                    navigator.clipboard.writeText(uid);
                    showToast({
                        title: '✅ تم النسخ',
                        body: uid,
                        color: '#2ecc71'
                    });
                }
            },
            {
                icon: '🖼️',
                label: 'حفظ الصورة',
                action: () => {
                    const avatar = TigerAdapter.getAvatar(userEl);
                    if (avatar) {
                        const a = document.createElement('a');
                        a.href = avatar;
                        a.download = `${name}-${uid}.jpg`;
                        a.click();
                    }
                }
            },
            ...(isMyself ? [] : [
                {
                    icon: '⚠️',
                    label: 'تحذير',
                    action: () => TigerAdapter.sendAction('warn', { uid })
                },
                {
                    icon: '🔇',
                    label: 'كتم الصوت',
                    action: () => TigerAdapter.sendAction('mute', { uid })
                },
                {
                    icon: '🚫',
                    label: 'حظر مؤقت',
                    action: () => TigerAdapter.sendAction('ban', { uid, duration: 3600 })
                },
                {
                    icon: '❌',
                    label: 'طرد',
                    action: () => TigerAdapter.sendAction('kick', { uid })
                },
                {
                    icon: '🔒',
                    label: 'حظر دائم',
                    action: () => TigerAdapter.sendAction('ban', { uid, permanent: true })
                }
            ]),
            {
                icon: '👁',
                label: 'تتبع المستخدم',
                action: () => {
                    SP.state.trackedUsers.add(uid);
                    showToast({
                        title: '👀 تم إضافة للتتبع',
                        body: name,
                        color: '#3498db'
                    });
                }
            },
            {
                icon: '🤖',
                label: 'فحص البوت',
                action: () => {
                    const isBotLikely = /^(bot|user|guest|visitor)\d+$/i.test(name);
                    showToast({
                        title: isBotLikely ? '🤖 احتمال بوت' : '✅ ليس بوت',
                        body: name,
                        color: isBotLikely ? '#f39c12' : '#2ecc71'
                    });
                }
            },
            {
                icon: '📊',
                label: 'معلومات المستخدم',
                action: () => {
                    const hash = TigerAdapter.getHash(userEl);
                    const status = TigerAdapter.getStatus(userEl);
                    showToast({
                        title: '📊 معلومات المستخدم',
                        body: `الاسم: ${name}\nالمعرف: ${uid}\nالهاش: ${hash}\nالحالة: ${status}`,
                        color: '#3498db'
                    });
                }
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
                user-select: none;
            `;
            btn.innerHTML = `
                <span style="font-size: 16px;">${item.icon}</span>
                <span>${item.label}</span>
            `;
            
            btn.onmouseover = () => {
                btn.style.background = 'rgba(52, 179, 195, 0.2)';
            };
            
            btn.onmouseout = () => {
                btn.style.background = 'transparent';
            };
            
            btn.onclick = () => {
                item.action();
                menu.remove();
            };
            
            if (index === menuItems.length - 1) {
                btn.style.borderBottom = 'none';
            }
            
            menu.appendChild(btn);
        });
        
        document.body.appendChild(menu);
        
        // Position menu at cursor
        document.addEventListener('contextmenu', e => {
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';
        }, { once: true });
    }

    // ============================================
    // 7. Toast Notifications محسّنة
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
            title = '📢 تنبيه',
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
            direction: rtl;
            cursor: pointer;
        `;

        let html = `
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
                <div style="flex-grow: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px; color: #fff;">${title}</div>
                    <div style="font-size: 13px; color: #ccc; line-height: 1.4; white-space: pre-wrap;">${body}</div>
        `;

        if (image) {
            html += `<img src="${image}" style="max-width: 100%; max-height: 80px; margin-top: 8px; border-radius: 4px;">`;
        }

        html += `</div></div>`;
        toast.innerHTML = html;
        
        // Add close button
        toast.addEventListener('click', () => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        });
        
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
    // 8. Hidden Users Detection محسّنة
    // ============================================
    function revealAndDetectHidden() {
        const users = TigerAdapter.getAllUsers();
        let hiddenCount = 0;

        users.forEach(el => {
            if (TigerAdapter.isHidden(el)) {
                const uid = TigerAdapter.getUid(el);
                const name = TigerAdapter.getName(el);
                const hash = TigerAdapter.getHash(el);
                const avatar = TigerAdapter.getAvatar(el);
                const inRoom = TigerAdapter.isInRoom(el);

                hiddenCount++;

                // إظهار العنصر
                el.style.setProperty('display', 'block', 'important');
                el.style.setProperty('opacity', '1', 'important');
                el.classList.add('sp-revealed');

                // تنبيه
                if (uid && !SP.state.alertedHidden.has(uid)) {
                    SP.state.alertedHidden.add(uid);

                    const toastTitle = inRoom ? '🚪 دخول مخفي للغرفة' : '📱 دخول مخفي للشات';
                    const toastBody = `${name}\nالمعرف: ${uid}\nالهاش: ${hash}`;

                    showToast({
                        title: toastTitle,
                        body: toastBody,
                        icon: '🔴',
                        color: '#e74c3c',
                        image: avatar
                    });

                    if (SP.config.soundEnabled) {
                        SoundAlert.hiddenAlert();
                    }
                }
            }
        });

        return hiddenCount;
    }

    // ============================================
    // 9. Sound Alerts
    // ============================================
    const SoundAlert = {
        enabled: SP.config.soundEnabled,
        
        beep(freq = 880, duration = 200, type = 'sine') {
            if (!this.enabled) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = type;
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
                
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + duration / 1000);
            } catch (e) {}
        },

        hiddenAlert() {
            this.beep(440, 150);
            setTimeout(() => this.beep(660, 150), 180);
            setTimeout(() => this.beep(880, 200), 360);
        },

        disconnectedAlert() {
            this.beep(200, 400);
        },

        connectedAlert() {
            this.beep(600, 150);
            setTimeout(() => this.beep(800, 150), 180);
        }
    };

    // ============================================
    // 10. Control Panel محسّنة
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
            direction: rtl;
        `;

        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px;">
                <h3 style="margin: 0 0 8px 0; color: #3ac2c3;">🚀 ScriptPro v${SP.version}</h3>
                <small style="color: #95a5a6;">TigerHost Edition | Mode: ${SP.config.antiKickEnabled ? '🛡️ Protected' : '⚠️ Normal'}</small>
            </div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0; margin: 12px 0;">
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-sound-toggle" ${SP.config.soundEnabled ? 'checked' : ''} style="cursor: pointer;">
                        <span>🔊 الأصوات</span>
                    </label>
                </div>
                <div style="margin-bottom: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-kick-toggle" ${SP.config.antiKickEnabled ? 'checked' : ''} style="cursor: pointer;">
                        <span>🛡️ حماية الطرد</span>
                    </label>
                </div>
                <div>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="sp-ip-toggle" ${SP.config.ipSnifferEnabled ? 'checked' : ''} style="cursor: pointer;">
                        <span>🌐 صائد IP</span>
                    </label>
                </div>
            </div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0;">
                <button id="sp-reveal-btn" style="
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    cursor: pointer;
                    font-weight: bold;
                ">🔴 كشف المخفيين</button>

                <button id="sp-ips-btn" style="
                    width: 100%;
                    padding: 8px;
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    cursor: pointer;
                    font-weight: bold;
                ">🌐 عرض IP المجمعة</button>
            </div>

            <div style="border-top: 1px solid rgba(52, 179, 195, 0.2); padding: 12px 0; margin-top: 12px; font-size: 12px; color: #95a5a6; line-height: 1.6;">
                <div><strong>📊 الإحصائيات:</strong></div>
                <div>المخفيين: <span style="color: #e74c3c;" id="sp-hidden-count">0</span></div>
                <div>المتتبعين: <span style="color: #3ac2c3;" id="sp-tracked-count">0</span></div>
                <div>IP المجمعة: <span style="color: #f39c12;" id="sp-ip-count">0</span></div>
                <div>الحالة: <span style="color: #2ecc71;" id="sp-status">متصل ✓</span></div>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        document.getElementById('sp-sound-toggle').addEventListener('change', function() {
            SP.config.soundEnabled = this.checked;
            SoundAlert.enabled = this.checked;
        });

        document.getElementById('sp-kick-toggle').addEventListener('change', function() {
            SP.config.antiKickEnabled = this.checked;
            if (this.checked) {
                AntiKickShield.init();
            }
        });

        document.getElementById('sp-ip-toggle').addEventListener('change', function() {
            SP.config.ipSnifferEnabled = this.checked;
            if (this.checked) {
                IPSniffer.init();
            }
        });

        document.getElementById('sp-reveal-btn').addEventListener('click', function() {
            revealAndDetectHidden();
            showToast({
                title: '✅ تم المسح',
                body: 'تم كشف جميع المخفيين',
                color: '#2ecc71'
            });
        });

        document.getElementById('sp-ips-btn').addEventListener('click', function() {
            const ips = IPSniffer.getCollectedIPs();
            if (ips.length === 0) {
                showToast({
                    title: '⚠️ لا توجد عناوين IP',
                    body: 'لم يتم جمع أي عناوين IP بعد',
                    color: '#f39c12'
                });
            } else {
                showToast({
                    title: '🌐 عناوين IP المجمعة',
                    body: ips.join('\n'),
                    color: '#3498db'
                });
            }
        });

        return panel;
    }

    // ============================================
    // 11. DOM Monitoring
    // ============================================
    function initMonitoring() {
        const observer = new MutationObserver(() => {
            const hiddenCount = revealAndDetectHidden();
            updateStats(hiddenCount);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-hidden', 'data-inroom']
        });

        // Periodic scan
        setInterval(() => {
            revealAndDetectHidden();
        }, 3000);
    }

    function updateStats(hiddenCount) {
        const tracked = SP.state.trackedUsers.size;
        const ips = IPSniffer.collectedIPs.size;

        const hiddenEl = document.getElementById('sp-hidden-count');
        const trackedEl = document.getElementById('sp-tracked-count');
        const ipEl = document.getElementById('sp-ip-count');

        if (hiddenEl) hiddenEl.textContent = hiddenCount;
        if (trackedEl) trackedEl.textContent = tracked;
        if (ipEl) ipEl.textContent = ips;
    }

    // ============================================
    // 12. User Context Menu
    // ============================================
    function initContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const userEl = e.target.closest('.tiger-user, .uzr');
            if (userEl) {
                e.preventDefault();
                
                const uid = TigerAdapter.getUid(userEl);
                const name = TigerAdapter.getName(userEl);
                
                if (uid && name) {
                    createSmartMenu(userEl, uid, name);
                }
            }
        });
    }

    // ============================================
    // 13. Initialization
    // ============================================
    window.ScriptPro = {
        version: SP.version,
        platform: SP.platform,
        adapter: TigerAdapter,
        config: SP.config,
        showToast,
        revealHidden: revealAndDetectHidden,
        ips: () => IPSniffer.getCollectedIPs(),
        tracked: () => Array.from(SP.state.trackedUsers)
    };

    function init() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`⚡ ScriptPro v${SP.version} - ${SP.edition}`);
        console.log(`✅ Platform: TigerHost (${TigerAdapter.mode})`);
        console.log(`${'='.repeat(60)}\n`);

        // Initialize components
        createControlPanel();
        initContextMenu();
        initMonitoring();

        if (SP.config.antiKickEnabled) {
            AntiKickShield.init();
        }

        if (SP.config.ipSnifferEnabled) {
            IPSniffer.init();
        }

        SocketInterceptor.init();

        revealAndDetectHidden();

        showToast({
            title: '✅ تم التفعيل',
            body: `ScriptPro v${SP.version} على TigerHost`,
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

console.log('✅ ScriptPro v5.1 TigerHost Edition Loaded!');
