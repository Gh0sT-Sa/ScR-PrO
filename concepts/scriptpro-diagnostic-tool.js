/**
 * 🔍 ScriptPro v5.2 - Diagnostic Tool
 * أداة تشخيص شاملة للعثور على مسبب المشكلة
 * 
 * استخدام:
 * انسخ هذا الكود في Console واضغط Enter
 */

(function() {
    'use strict';
    
    console.clear();
    console.log('%c🔍 ScriptPro v5.2 - Diagnostic Tool Started', 'color: #3ac2c3; font-size: 16px; font-weight: bold;');
    console.log('%c' + '='.repeat(60), 'color: #3ac2c3;');
    
    const DIAGNOSTIC = {
        results: {},
        errors: [],
        warnings: [],
        startTime: Date.now()
    };
    
    // ============================================
    // 1. فحص البيئة الأساسية
    // ============================================
    console.log('\n📋 Phase 1: Checking Environment...\n');
    
    // فحص المتصفح
    const userAgent = navigator.userAgent;
    console.log(`✅ User Agent: ${userAgent.substring(0, 50)}...`);
    DIAGNOSTIC.results.browser = userAgent;
    
    // فحص الذاكرة
    if (performance.memory) {
        const memUsed = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        const memLimit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
        console.log(`✅ Memory: ${memUsed}MB / ${memLimit}MB`);
        DIAGNOSTIC.results.memory = `${memUsed}MB / ${memLimit}MB`;
    }
    
    // فحص الاتصال
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        console.log(`✅ Connection: ${connection.effectiveType} (${connection.downlink?.toFixed(2) || 'N/A'} Mbps)`);
        DIAGNOSTIC.results.connection = connection.effectiveType;
    } else {
        console.log('⚠️ Connection API not available');
        DIAGNOSTIC.warnings.push('No Connection API');
    }
    
    // ============================================
    // 2. فحص DOM والمكتبات
    // ============================================
    console.log('\n📋 Phase 2: Checking DOM & Libraries...\n');
    
    // فحص jQuery
    if (typeof jQuery !== 'undefined') {
        console.log(`✅ jQuery Found: v${jQuery.fn.jquery}`);
        DIAGNOSTIC.results.jquery = jQuery.fn.jquery;
    } else {
        console.log('❌ jQuery NOT Found');
        DIAGNOSTIC.errors.push('jQuery not loaded');
    }
    
    // فحص Socket.IO
    if (typeof socket !== 'undefined') {
        console.log('✅ Socket.IO Found');
        console.log(`   - Connected: ${socket.connected}`);
        console.log(`   - ID: ${socket.id?.substring(0, 10) || 'N/A'}...`);
        DIAGNOSTIC.results.socketio = {
            found: true,
            connected: socket.connected,
            id: socket.id
        };
    } else {
        console.log('❌ Socket.IO NOT Found');
        DIAGNOSTIC.errors.push('Socket.IO not loaded');
    }
    
    // فحص Platform
    console.log('\n🎯 Platform Detection:\n');
    
    let platform = 'unknown';
    let platformReason = '';
    
    // Qloob Detection
    if (document.domain.includes('chatjawaly') || window.location.hostname.includes('qloob')) {
        platform = 'qloob';
        platformReason = 'Domain/Hostname match';
        console.log('✅ QLOOB/ChatJawaly Detected');
    }
    // TigerHost Detection
    else if (typeof TigerChat !== 'undefined') {
        platform = 'tiger';
        platformReason = 'TigerChat global found';
        console.log('✅ TigerHost Detected (TigerChat global)');
    }
    else if (document.querySelector('.tiger-user')) {
        platform = 'tiger';
        platformReason = '.tiger-user elements found';
        console.log('✅ TigerHost Detected (.tiger-user)');
    }
    // JawalHost Detection
    else if (document.querySelector('.uzr') && typeof upro === 'function') {
        platform = 'jawal';
        platformReason = '.uzr + upro function found';
        console.log('✅ JawalHost Detected (.uzr + upro)');
    }
    else if (document.querySelector('.uzr')) {
        platform = 'jawal';
        platformReason = '.uzr elements found';
        console.log('✅ Likely JawalHost (.uzr found)');
    }
    
    console.log(`   Reason: ${platformReason}`);
    console.log(`   Domain: ${document.domain}`);
    DIAGNOSTIC.results.platform = { detected: platform, reason: platformReason };
    
    // ============================================
    // 3. فحص الـ Selectors
    // ============================================
    console.log('\n📋 Phase 3: Checking Selectors...\n');
    
    const selectors = {
        '.uzr': document.querySelectorAll('.uzr').length,
        '.tiger-user': document.querySelectorAll('.tiger-user').length,
        '.ph-user': document.querySelectorAll('.ph-user').length,
        '.user-item': document.querySelectorAll('.user-item').length,
        '#users': document.querySelector('#users') ? '✅' : '❌',
        '.u-pic': document.querySelectorAll('.u-pic').length,
        '.t-pic': document.querySelectorAll('.t-pic').length,
        'img.ustat': document.querySelectorAll('img.ustat').length
    };
    
    Object.entries(selectors).forEach(([selector, count]) => {
        const status = count === 0 ? '❌' : (count === '✅' ? '✅' : '✅');
        console.log(`${status} ${selector}: ${count}`);
    });
    DIAGNOSTIC.results.selectors = selectors;
    
    // ============================================
    // 4. فحص الدوال العامة
    // ============================================
    console.log('\n📋 Phase 4: Checking Global Functions...\n');
    
    const globalFunctions = {
        'upro': typeof upro,
        'openUserProfile': typeof openUserProfile,
        'openw': typeof openw,
        'send': typeof window.send,
        'Load_Socket': typeof window.Load_Socket,
        'ToastUI': typeof window.ToastUI
    };
    
    Object.entries(globalFunctions).forEach(([func, type]) => {
        const status = type === 'function' ? '✅' : '❌';
        console.log(`${status} ${func}: ${type}`);
        if (type === 'function') {
            DIAGNOSTIC.results[func] = 'available';
        } else {
            DIAGNOSTIC.warnings.push(`${func} not available`);
        }
    });
    
    // ============================================
    // 5. فحص الـ Global Variables
    // ============================================
    console.log('\n📋 Phase 5: Checking Global Variables...\n');
    
    const globals = {
        'window.myid': window.myid,
        'window.myroom': window.myroom,
        'window.__APP_MODE__': window.__APP_MODE__,
        'window.MODE': window.MODE,
        'window.ucach': typeof window.ucach,
        'window.users': typeof window.users
    };
    
    Object.entries(globals).forEach(([name, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`${status} ${name}: ${typeof value === 'object' ? '[Object]' : value || 'undefined'}`);
        DIAGNOSTIC.results[name] = value;
    });
    
    // ============================================
    // 6. فحص Storage
    // ============================================
    console.log('\n📋 Phase 6: Checking Storage...\n');
    
    try {
        const storageTest = '__sp_test__';
        localStorage.setItem(storageTest, 'test');
        localStorage.removeItem(storageTest);
        console.log('✅ localStorage: Available');
        DIAGNOSTIC.results.localStorage = 'available';
    } catch (e) {
        console.log('❌ localStorage: ' + e.message);
        DIAGNOSTIC.errors.push('localStorage not available');
    }
    
    try {
        sessionStorage.setItem('__sp_test__', 'test');
        sessionStorage.removeItem('__sp_test__');
        console.log('✅ sessionStorage: Available');
        DIAGNOSTIC.results.sessionStorage = 'available';
    } catch (e) {
        console.log('❌ sessionStorage: ' + e.message);
        DIAGNOSTIC.errors.push('sessionStorage not available');
    }
    
    // ============================================
    // 7. فحص Document Ready State
    // ============================================
    console.log('\n📋 Phase 7: Checking Document State...\n');
    
    console.log(`✅ Document Ready State: ${document.readyState}`);
    console.log(`✅ Document.body: ${document.body ? '✅' : '❌'}`);
    console.log(`✅ DOM Elements: ${document.querySelectorAll('*').length}`);
    DIAGNOSTIC.results.documentState = {
        readyState: document.readyState,
        bodyExists: !!document.body,
        totalElements: document.querySelectorAll('*').length
    };
    
    // ============================================
    // 8. فحص Security & CORS
    // ============================================
    console.log('\n📋 Phase 8: Checking Security & CORS...\n');
    
    console.log(`✅ Protocol: ${window.location.protocol}`);
    console.log(`✅ HTTPS: ${window.location.protocol === 'https:' ? '✅ Yes' : '⚠️ No'}`);
    console.log(`✅ Origin: ${window.location.origin}`);
    console.log(`✅ CSP: ${document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? '⚠️ Enabled' : '✅ Not Restricted'}`);
    
    DIAGNOSTIC.results.security = {
        protocol: window.location.protocol,
        origin: window.location.origin,
        cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    };
    
    // ============================================
    // 9. فحص CDN Access
    // ============================================
    console.log('\n📋 Phase 9: Testing CDN Access...\n');
    
    console.log('⏳ Testing CDN connectivity...');
    
    fetch('https://cdn.jsdelivr.net/gh/Gh0sT-Sa/scriptpro@main/scriptpro-v5.2-ultimate.js', {
        method: 'HEAD',
        mode: 'no-cors'
    })
    .then(() => {
        console.log('✅ CDN Accessible: YES');
        DIAGNOSTIC.results.cdnAccess = 'accessible';
    })
    .catch(err => {
        console.log('❌ CDN Error: ' + err.message);
        DIAGNOSTIC.errors.push('CDN not accessible: ' + err.message);
        DIAGNOSTIC.results.cdnAccess = 'error: ' + err.message;
    });
    
    // ============================================
    // 10. Summary & Recommendations
    // ============================================
    setTimeout(() => {
        console.log('\n' + '%c' + '='.repeat(60), 'color: #3ac2c3;');
        console.log('%c📊 DIAGNOSTIC SUMMARY', 'color: #2ecc71; font-size: 14px; font-weight: bold;');
        console.log('%c' + '='.repeat(60), 'color: #3ac2c3;');
        
        console.log('\n✅ PASSED CHECKS:');
        console.log(`   • Platform Detected: ${DIAGNOSTIC.results.platform.detected}`);
        console.log(`   • Users Found: ${DIAGNOSTIC.results.selectors['.uzr'] || DIAGNOSTIC.results.selectors['.tiger-user'] || 'Unknown'}`);
        console.log(`   • Socket.IO: ${DIAGNOSTIC.results.socketio?.connected ? 'Connected' : 'Not connected'}`);
        console.log(`   • jQuery: ${DIAGNOSTIC.results.jquery || 'Not found'}`);
        
        if (DIAGNOSTIC.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            DIAGNOSTIC.warnings.forEach(w => console.log(`   • ${w}`));
        }
        
        if (DIAGNOSTIC.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            DIAGNOSTIC.errors.forEach(e => console.log(`   • ${e}`));
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (DIAGNOSTIC.errors.includes('jQuery not loaded')) {
            console.log('   1. jQuery is not loaded. Try reloading the page.');
        }
        
        if (DIAGNOSTIC.errors.includes('Socket.IO not loaded')) {
            console.log('   2. Socket.IO is not loaded. The page may still be loading.');
            console.log('      Try waiting a few seconds then run diagnostic again.');
        }
        
        if (DIAGNOSTIC.results.cdnAccess === 'error') {
            console.log('   3. CDN is not accessible. Try using a VPN or different network.');
        }
        
        if (!DIAGNOSTIC.results.socket?.connected) {
            console.log('   4. Socket is not connected. The chat server may be offline.');
        }
        
        console.log('\n🔧 NEXT STEPS:');
        console.log('   1. Review the warnings and errors above');
        console.log('   2. Run this diagnostic again after the page fully loads');
        console.log('   3. If CDN is blocked, use the inline version:');
        console.log('      window.LOAD_SCRIPTPRO_INLINE = true;');
        console.log('   4. Report errors to: Gh0sT-Sa');
        
        console.log('\n📋 FULL DIAGNOSTIC DATA:');
        console.log(DIAGNOSTIC);
        
        // Save to localStorage
        try {
            localStorage.setItem('sp_diagnostic', JSON.stringify(DIAGNOSTIC));
            console.log('\n✅ Diagnostic data saved to localStorage');
        } catch (e) {
            console.log('\n⚠️ Could not save diagnostic data');
        }
        
        console.log('\n%c' + '='.repeat(60), 'color: #3ac2c3;');
        console.log('%c✅ Diagnostic Complete!', 'color: #2ecc71; font-size: 14px; font-weight: bold;');
        
        // جعل البيانات متاحة في الـ console
        window.SP_DIAGNOSTIC = DIAGNOSTIC;
        console.log('\n💾 Data available as: window.SP_DIAGNOSTIC');
        
    }, 2000);
    
})();

console.log('\n%c🔍 Diagnostic tool running... Check console in 2 seconds for results', 'color: #f39c12; font-size: 12px;');
