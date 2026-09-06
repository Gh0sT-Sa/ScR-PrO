/**
 * 📊 JawalHost vs TigerHost - Comparative Analysis Report
 * تحليل مقارن شامل بين نسخة قلوب (Qloob/ChatJawaly) وتايجر هوست
 * 
 * التاريخ: 2026-07-06
 * المحلل: ScriptPro Analysis Engine
 * 
 * ملفات Qloob المحللة:
 * ✅ chatjawaly.html - البنية الأساسية
 * ✅ cj33.js - المحرك الرئيسي (مشفر)
 * ✅ styleT.css - أنماط TigerHost
 * ✅ thReconnectOverlay.css - نظام إعادة الاتصال
 * ✅ thReconnectOverlayUi.js - واجهة إعادة الاتصال
 * ✅ thSocketReconnectCore.js - نواة إعادة الاتصال
 * ✅ thSocketReconnectChatAdapter.js - محول الدردشة
 * ✅ thWebRtcIce.js - نظام WebRTC
 * ✅ x.js / xT.js - JavaScript محسّنة
 */

// ============================================
// 1. معلومات النسخة - Platform Signature
// ============================================

const QloobPlatformInfo = {
    name: 'ChatJawaly (قلوب)',
    domain: 'chatjawaly.com',
    baseUrl: 'https://chatjawaly.com',
    engine: 'TigerHost (Modified)',
    mode: 'advanced',
    appMode: 'TigerHost LTD Mode',
    version: 'v1782064965417',
    cacheVersion: '?v=1782064965417',
    
    // ✅ Global Settings
    globalFlags: {
        DELWETCH: false,           // لا تحذف شريط المشاهدين
        DELPROFILEL: true,         // احذف قائمة الملفات الشخصية
        HIDEGAMES: false,          // لا تخفي الألعاب
        HIDELUDO: false,           // لا تخفي لودو
        DISABLE_NOTIF_SOUND: true, // عطّل أصوات التنبيهات (مختلف عن TigerHost!)
        DISABLE_MENTION: false,    // لا تعطّل الإشارات
        DELSTORY: false,           // لا تحذف الحكايات
        DELImageInRoom: false,     // لا تحذف صور الغرفة
        Stars: false,              // النجوم معطّلة
        TH_TIGER_HOST_AUDIO_STAY_ENABLED: true // الصوت مفعّل دائماً
    },
    
    // ✅ CSS Variables (Theme)
    theme: {
        '--mic-url': 'url("/site/chatjawaly.commicpicc.gif")',
        '--mic-url2': 'url("/mic.png")',
        '--daymsg': 'url("/site/chatjawaly.compmgpic.gif")',
        '--bt-primary': '#63636b',     // زر أساسي (رمادي داكن)
        '--bg-primary': '#999798',     // خلفية أساسية (رمادي فاتح)
        '--hi-light': '#f7f4eb'        // تمييز (كريمي فاتح)
    },
    
    // ✅ Feature Differences
    features: {
        RECONNECT_OVERLAY: true,
        SOCKET_RECONNECT_CORE: true,
        WEBRTC_ICE: true,
        CHAT_ADAPTER: true,
        AUDIO_STREAMING: true,
        SOUND_DISABLED_DEFAULT: true  // ⚠️ مختلف عن TigerHost
    }
};

// ============================================
// 2. DOM Structure - محددات العناصر
// ============================================

const QloobDOMStructure = {
    users: {
        container: '#users, [data-users-container]',
        item: '.uzr, .tiger-user',      // ⚠️ يستخدم .uzr أيضاً (مثل JawalHost)
        inRoom: '.uzr.inroom, .tiger-user.inroom',
        hidden: '.uzr.is-hidden, [data-hidden="true"]'
    },
    
    userProperties: {
        id: {
            primary: 'data-uid',
            secondary: 'data-user-id',
            fallback: '[class*="uid"]'   // كلاس يبدأ بـ uid
        },
        name: {
            primary: 'getAttribute("n")',
            secondary: '.u-topic, .user-name',
            tertiary: 'innerText (first line)'
        },
        avatar: {
            primary: '.u-pic, .t-pic',   // backgroundImage
            secondary: 'img.avatar',
            tertiary: 'img[src*="pic"]'
        },
        status: {
            hidden: 'img.ustat[src*="s4.png"]',
            online: 'img.ustat[src*="s0.png"]',
            idle: 'img.ustat[src*="s1.png"]',
            away: 'img.ustat[src*="s2.png"]',
            dnd: 'img.ustat[src*="s3.png"]'
        },
        hash: {
            primary: '.uhash',
            secondary: 'data-hash',
            fallback: '[data-user-hash]'
        },
        icon: {
            selector: '.u-ico, [data-user-icon]'
        }
    },
    
    ui: {
        modals: '.modal, .modal-dialog, .modal-content',
        buttons: '.btn-primary, .btn-success, .btn-danger, [role="button"]',
        labels: '.label-primary, .label-success, .label-danger',
        tables: '.table.dataTable, .tablesorter',
        tabs: '.tab-content, .tab-pane, .tab-pane.active',
        messageBox: '#tbox, [data-message-input]',
        notification: '.notification, [data-notification]'
    },
    
    // ⚠️ Qloob-Specific Elements
    qloobSpecific: {
        micIcon: '.u-ico img[src*="mic"]',
        profileLink: '.u-topic, .profile-link',
        storySection: '[data-story], .story-container',
        wetchContainer: '#TH_WETCH, .wetch-panel'
    }
};

// ============================================
// 3. Socket & Communication System
// ============================================

const QloobSocketSystem = {
    initialization: {
        method: '$(document).ready(function() { Load_Socket() })',
        file: 'cp-socket.js',
        reconnection: {
            enabled: true,
            system: 'thSocketReconnectCore.js',
            overlay: 'thReconnectOverlayUi.js',
            adapter: 'thSocketReconnectChatAdapter.js'
        }
    },
    
    events: {
        connection: ['connect', 'disconnect', 'reconnect', 'reconnect_attempt'],
        user: ['user:join', 'user:leave', 'user:hidden', 'user:visible'],
        messages: ['message', 'broadcast', 'notification'],
        room: ['room:update', 'room:created', 'room:deleted'],
        
        // ⚠️ Qloob-Specific Events
        qloobEvents: [
            'audio:start',      // محسّن الصوت في Qloob
            'audio:stop',
            'voice:quality',    // جودة الصوت (LiveKit)
            'bitrate:update'    // تحديث معدل نقل البيانات
        ]
    },
    
    commands: {
        user: {
            kick: 'send("cp", { cmd: "kick", uid: userId })',
            ban: 'send("cp", { cmd: "ban", uid: userId, duration?: number })',
            mute: 'send("cp", { cmd: "mute", uid: userId })',
            warn: 'send("cp", { cmd: "warn", uid: userId, msg: message })',
            setpower: 'send("cp", { cmd: "setpower", uid: userId, power: level })'
        },
        room: {
            list: 'send("cp", { cmd: "rooms", q: query })',
            delete: 'send("cp", { cmd: "delroom", id: roomId })',
            update: 'send("cp", { cmd: "updateroom", id: roomId, data: {} })'
        },
        message: {
            delete: 'send("cp", { cmd: "delmsg", mid: messageId })',
            deleteBC: 'send("cp", { cmd: "delbc", bid: broadcastId })'
        }
    }
};

// ============================================
// 4. Audio & WebRTC System (Qloob Enhancement)
// ============================================

const QloobAudioSystem = {
    enabled: true,
    framework: 'LiveKit',
    
    webrtc: {
        file: 'thWebRtcIce.js',
        iceServers: [
            'stun:stun.relay.metered.ca:80',
            'turn:turn.d-arish.com:3478?transport=udp',
            'turn:turn.relay.metered.ca:80?transport=udp',
            'turn:turn.relay.metered.ca:80?transport=tcp',
            'turn:turn.relay.metered.ca:443?transport=tcp'
        ],
        modes: [
            'TH_WEBRTC_ICE_MODE_DEFAULT',
            'TH_WEBRTC_ICE_MODE_RELAY443'
        ],
        iceTransportPolicy: 'relay'  // ⚠️ مهم للخصوصية
    },
    
    // ⚠️ Audio Quality Monitoring
    audioQuality: {
        events: [
            'bitrate_change',
            'quality_update',
            'audio_level_change'
        ],
        metrics: {
            bitrate: 'kbps',
            quality: 'excellent | good | fair | poor',
            latency: 'ms'
        }
    },
    
    // ⚠️ Qloob-Specific Audio Settings
    qloobAudioFlags: {
        TH_TIGER_HOST_AUDIO_STAY_ENABLED: true,  // الصوت يبقى نشطاً دائماً
        DISABLE_NOTIF_SOUND: true,               // تعطيل أصوات التنبيهات
        AUTO_MIC_DETECTION: true,
        ECHO_CANCELLATION: true,
        NOISE_SUPPRESSION: true
    }
};

// ============================================
// 5. Reconnection System (Advanced)
// ============================================

const QloobReconnectionSystem = {
    overlay: {
        file: 'thReconnectOverlayUi.js',
        selectors: ['.ovr', '.over'],
        styling: {
            width: '100%',
            height: '100%',
            zIndex: '999999',
            position: 'fixed',
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }
    },
    
    core: {
        file: 'thSocketReconnectCore.js',
        features: [
            'Auto-reconnection',
            'State recovery',
            'Message buffering',
            'Connection status tracking'
        ]
    },
    
    adapter: {
        file: 'thSocketReconnectChatAdapter.js',
        methods: [
            'showReconnectOverlay()',
            'hideReconnectOverlay()',
            'updateConnectionStatus(status)',
            'handleIntentionalClose()',
            'playReconnectSound()'
        ]
    },
    
    // ⚠️ Qloob-Specific Flags
    qloobFlags: {
        TH_RECONNECT_WATCH_RESET_TIGERHOST: true,
        TH_BG_RECONNECT_IN_PROGRESS_TIGERHOST: true,
        isIntentionalClose: false
    }
};

// ============================================
// 6. Key Differences: Qloob vs TigerHost
// ============================================

const DifferencesQloobVsTiger = {
    similarities: [
        '✅ نفس محرك TigerHost الأساسي',
        '✅ نفس نظام Socket.IO',
        '✅ نفس WebRTC ICE',
        '✅ نفس نظام إعادة الاتصال'
    ],
    
    differences: {
        soundNotifications: {
            TigerHost: 'ENABLED by default',
            Qloob: 'DISABLED by default (DISABLE_NOTIF_SOUND: true)',
            impact: 'أصوات التنبيهات مطفأة في Qloob'
        },
        
        profileManagement: {
            TigerHost: 'DELPROFILEL: false',
            Qloob: 'DELPROFILEL: true',
            impact: 'قوائم الملفات الشخصية مخفية في Qloob'
        },
        
        audioStreaming: {
            TigerHost: 'معايير عادية',
            Qloob: 'TH_TIGER_HOST_AUDIO_STAY_ENABLED: true',
            impact: 'الصوت يبقى متصلاً دائماً في Qloob'
        },
        
        iceTransportPolicy: {
            TigerHost: 'سياسة معيارية',
            Qloob: 'RELAY443 mode - جميع الاتصالات عبر خادم وسيط',
            impact: 'خصوصية أفضل، لكن قد تكون أبطأ'
        },
        
        cssTheme: {
            TigerHost: '--bt-primary: #616161',
            Qloob: '--bt-primary: #63636b',
            impact: 'فروقات لونية طفيفة فقط'
        }
    }
};

// ============================================
// 7. Hidden User Detection Enhancements
// ============================================

const QloobHiddenDetectionStrategy = {
    // ⚠️ في Qloob، المستخدمون المخفيون قد يكونون:
    
    multiLayerDetection: [
        {
            layer: 1,
            name: 'Class-Based Detection',
            selectors: ['.uzr.is-hidden', '.tiger-user.is-hidden'],
            reliability: 'Very High'
        },
        {
            layer: 2,
            name: 'Status Image Detection',
            selectors: ['img.ustat[src*="s4.png"]'],
            reliability: 'High'
        },
        {
            layer: 3,
            name: 'Data Attribute Detection',
            selectors: ['[data-hidden="true"]', '[data-status="hidden"]'],
            reliability: 'Medium'
        },
        {
            layer: 4,
            name: 'Opacity/Display Detection',
            selectors: ['element.style.opacity === "0"', 'element.style.display === "none"'],
            reliability: 'Low'
        },
        {
            layer: 5,
            name: 'Socket Event Detection (Qloob-Specific)',
            events: ['user:hidden', 'visibility:changed'],
            reliability: 'Very High'
        }
    ],
    
    // ⚠️ Qloob-Specific Hidden Indicators
    qloobIndicators: {
        micDisabled: '.u-ico img[src*="no-mic"]',
        muteIcon: '.u-ico.muted',
        cameraOff: '[data-camera-off]',
        invisibleMode: '[data-invisible]',
        lastSeen: 'data-last-seen attribute'
    }
};

// ============================================
// 8. Bot Detection in Qloob
// ============================================

const QloobBotDetectionPatterns = {
    suspiciousPatterns: [
        {
            pattern: /^(bot|user|guest|visitor|member)\d+$/i,
            score: 2,
            reason: 'Generic username pattern'
        },
        {
            pattern: /^[a-z]{1,3}\d{3,}$/i,
            score: 2,
            reason: 'Random short username'
        },
        {
            pattern: /test|debug|admin|moderator/i,
            score: 1,
            reason: 'Suspicious keywords'
        }
    ],
    
    // ⚠️ Qloob-Specific Bot Indicators
    qloobBotIndicators: {
        noAvatar: true,
        noMicPresence: 'no .u-ico[src*="mic"]',
        joinLeaveRapid: 'joins and leaves within 5 seconds',
        repeatMessages: 'same message multiple times',
        noInteraction: 'never sends messages or reacts'
    }
};

// ============================================
// 9. Anti-Kick Implementation for Qloob
// ============================================

const QloobAntiKickStrategy = {
    interceptionPoints: [
        {
            point: 'Socket Emit',
            method: 'Intercept socket.emit("cp", { cmd: "kick" })',
            reliability: 'Very High'
        },
        {
            point: 'DOM Monitoring',
            method: 'Watch for kick notification elements',
            reliability: 'Medium'
        },
        {
            point: 'Connection Status',
            method: 'Monitor connection state changes',
            reliability: 'High'
        }
    ],
    
    // ⚠️ Qloob-Specific Anti-Kick
    qloobDefense: {
        useReconnectionOverlay: true,
        bufferMessagesOnDisconnect: true,
        autoReconnect: true,
        preserveSessionState: true
    }
};

// ============================================
// 10. IP Sniffer for Qloob
// ============================================

const QloobIPSnifferEnhanced = {
    webrtcInterception: {
        method: 'RTCPeerConnection + WebRTC ICE candidates',
        accuracy: 'Very High'
    },
    
    // ⚠️ Qloob uses more sophisticated TURN/STUN
    servers: [
        'stun:stun.relay.metered.ca:80',
        'turn:turn.d-arish.com:3478?transport=udp',
        'turn:turn.relay.metered.ca:80?transport=udp',
        'turn:turn.relay.metered.ca:80?transport=tcp',
        'turn:turn.relay.metered.ca:443?transport=tcp'
    ],
    
    ipFiltering: {
        ignorePrivate: [
            /^10\./,
            /^172\.(1[6-9]|2\d|3[01])\./,
            /^192\.168\./,
            /^127\./
        ],
        ignoreRelayServers: [
            'stun.relay.metered.ca',
            'turn.d-arish.com',
            'turn.relay.metered.ca'
        ]
    }
};

// ============================================
// 11. Smart Menu Enhancements for Qloob
// ============================================

const QloobSmartMenuEnhancements = {
    baseMenu: [
        '👤 فتح الملف الشخصي',
        '💬 رسالة خاصة',
        '📋 نسخ المعرف',
        '🖼️ حفظ الصورة'
    ],
    
    // ⚠️ Qloob-Specific Menu Items
    qloobMenuItems: [
        {
            icon: '🎤',
            label: 'التحقق من الميكروفون',
            action: 'checkMicStatus(uid)',
            qloobOnly: true
        },
        {
            icon: '📊',
            label: 'جودة الصوت',
            action: 'checkAudioQuality(uid)',
            qloobOnly: true
        },
        {
            icon: '🚪',
            label: 'تتبع دخول/خروج',
            action: 'trackUserActivity(uid)',
            qloobOnly: true
        },
        {
            icon: '🎯',
            label: 'آخر نشاط',
            action: 'showLastActivity(uid)',
            qloobOnly: true
        }
    ]
};

// ============================================
// 12. Recommended Qloob Adapter
// ============================================

const QloobAdapterTemplate = `
{
    name: 'Qloob/ChatJawaly',
    engine: 'TigerHost Modified',
    
    // Selectors
    users: '.uzr, .tiger-user',
    pic: '.u-pic, .t-pic',
    
    // Get Methods
    getUid: (el) => {
        return el.getAttribute('data-uid') || 
               [...el.classList].find(c => c.startsWith('uid'))?.slice(3);
    },
    
    getName: (el) => {
        return el.getAttribute('n') || 
               el.querySelector('.u-topic')?.textContent?.trim();
    },
    
    getHash: (el) => {
        return el.querySelector('.uhash')?.textContent?.trim() || '—';
    },
    
    // ⚠️ Qloob-Specific Methods
    getMicStatus: (el) => {
        return !!el.querySelector('.u-ico img[src*="mic"]');
    },
    
    getAudioQuality: (el) => {
        const dataset = el.dataset;
        return dataset.audioQuality || dataset.bitrate || 'unknown';
    },
    
    getLastActivity: (el) => {
        return el.getAttribute('data-last-seen') || 
               el.querySelector('[data-activity]')?.textContent;
    },
    
    // Detection Methods
    isHidden: (el) => {
        return el.classList.contains('is-hidden') || 
               !!el.querySelector('img.ustat[src*="s4.png"]') ||
               el.getAttribute('data-hidden') === 'true';
    },
    
    // ⚠️ Qloob-Specific Detection
    isAudioActive: (el) => {
        return !!el.querySelector('.u-ico img[src*="mic"]') &&
               !el.classList.contains('muted');
    },
    
    isRecentlyActive: (el) => {
        const lastSeen = el.getAttribute('data-last-seen');
        if (!lastSeen) return true;
        const ago = new Date() - new Date(lastSeen);
        return ago < 60000; // Less than 1 minute
    }
}
`;

// ============================================
// 13. Integration Recommendations
// ============================================

const IntegrationRecommendations = {
    forQloobSupport: [
        '✅ استخدم نفس Adapter الأساسي مثل TigerHost',
        '✅ أضف دعم audio quality detection',
        '✅ أضف تتبع نشاط الميكروفون',
        '✅ اعتبر حالات الاتصال المختلفة (audio/video/text)',
        '✅ أضف معالجة خاصة للـ RELAY443 mode'
    ],
    
    criticalDifferences: [
        '⚠️ DISABLE_NOTIF_SOUND: true (مختلف عن TigerHost)',
        '⚠️ TH_TIGER_HOST_AUDIO_STAY_ENABLED: true (صوت دائم)',
        '⚠️ DELPROFILEL: true (إخفاء الملفات الشخصية)',
        '⚠️ ICE Transport Policy: RELAY (جميع الاتصالات عبر خادم وسيط)'
    ],
    
    testingPoints: [
        '🧪 Test hidden user detection with both .uzr and .tiger-user',
        '🧪 Test audio quality monitoring',
        '🧪 Test reconnection overlay behavior',
        '🧪 Test bot detection with Qloob patterns',
        '🧪 Test anti-kick with audio streaming'
    ]
};

console.log('✅ Qloob/ChatJawaly Analysis Complete!');
console.log('📊 All differences documented for seamless integration');
