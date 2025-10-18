// User Identification System
// Tạo unique user ID dựa trên browser fingerprint và IP

class UserIdentification {
  constructor() {
    this.userId = null;
    this.fingerprint = null;
    this.clientIP = null;
    this.initialized = false;
  }

  /**
   * Khởi tạo user identification
   */
  async initialize() {
    if (this.initialized) return this.userId;

    try {
      // Tạo browser fingerprint
      this.fingerprint = await this.generateFingerprint();
      
      // Lấy client IP
      this.clientIP = await this.getClientIP();
      
      // Tạo unique user ID
      this.userId = await this.generateUniqueUserId();
      
      this.initialized = true;
      console.log('User ID initialized:', this.userId);
      
      return this.userId;
    } catch (error) {
      console.error('Error initializing user identification:', error);
      // Fallback to simple random ID
      this.userId = this.generateFallbackId();
      this.initialized = true;
      return this.userId;
    }
  }

  /**
   * Tạo browser fingerprint
   */
  async generateFingerprint() {
    const components = [];
    
    try {
      // Screen information
      components.push(screen.width + 'x' + screen.height);
      components.push(screen.colorDepth);
      components.push(screen.pixelDepth);
      
      // Timezone
      components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      // Language
      components.push(navigator.language);
      components.push(navigator.languages?.join(',') || '');
      
      // Platform
      components.push(navigator.platform);
      components.push(navigator.userAgent);
      
      // Hardware concurrency
      components.push(navigator.hardwareConcurrency || 0);
      
      // Device memory (if available)
      components.push(navigator.deviceMemory || 0);
      
      // WebGL fingerprint
      const webglFingerprint = this.getWebGLFingerprint();
      components.push(webglFingerprint);
      
      // Canvas fingerprint
      const canvasFingerprint = this.getCanvasFingerprint();
      components.push(canvasFingerprint);
      
      // Audio context fingerprint
      const audioFingerprint = await this.getAudioFingerprint();
      components.push(audioFingerprint);
      
      // Combine all components
      const combinedString = components.join('|');
      
      // Hash the combined string
      return await this.hashString(combinedString);
      
    } catch (error) {
      console.error('Error generating fingerprint:', error);
      return 'fallback_' + Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Lấy WebGL fingerprint
   */
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'no-webgl';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = gl.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL || gl.VENDOR);
      const renderer = gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || gl.RENDERER);
      
      return vendor + '|' + renderer;
    } catch (error) {
      return 'webgl-error';
    }
  }

  /**
   * Lấy Canvas fingerprint
   */
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 200;
      canvas.height = 50;
      
      // Draw some text and shapes
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Stellar Drift', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint', 4, 35);
      
      return canvas.toDataURL();
    } catch (error) {
      return 'canvas-error';
    }
  }

  /**
   * Lấy Audio fingerprint
   */
  async getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      
      return new Promise((resolve) => {
        let sample = 0;
        scriptProcessor.onaudioprocess = (bins) => {
          if (sample < 1000) {
            sample++;
            return;
          }
          
          const output = bins.outputBuffer.getChannelData(0);
          const fingerprint = Array.from(output).slice(0, 30).join('');
          
          oscillator.stop();
          audioContext.close();
          
          resolve(fingerprint);
        };
        
        // Fallback timeout
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
          resolve('audio-timeout');
        }, 1000);
      });
    } catch (error) {
      return 'audio-error';
    }
  }

  /**
   * Lấy client IP
   */
  async getClientIP() {
    try {
      // Thử nhiều service để lấy IP
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.ip.sb/jsonip'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, { timeout: 3000 });
          const data = await response.json();
          const ip = data.ip || data.IP || data.query;
          if (ip) return ip;
        } catch (err) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.log('Could not detect client IP:', error);
      return null;
    }
  }

  /**
   * Tạo unique user ID
   */
  async generateUniqueUserId() {
    const components = [
      this.fingerprint,
      this.clientIP || 'no-ip',
      Date.now().toString().slice(-6) // Last 6 digits of timestamp for uniqueness
    ];
    
    const combinedString = components.join('_');
    const hashedId = await this.hashString(combinedString);
    
    // Tạo ID ngắn hơn và dễ đọc
    return 'user_' + hashedId.substr(0, 12);
  }

  /**
   * Hash string using Web Crypto API
   */
  async hashString(str) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback to simple hash
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }

  /**
   * Fallback ID generation
   */
  generateFallbackId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return 'user_fallback_' + timestamp + '_' + random;
  }

  /**
   * Lấy user ID hiện tại
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Kiểm tra xem đã khởi tạo chưa
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Lấy thông tin user đầy đủ
   */
  getUserInfo() {
    return {
      userId: this.userId,
      fingerprint: this.fingerprint,
      clientIP: this.clientIP,
      initialized: this.initialized
    };
  }
}

// Tạo instance global
const userIdentification = new UserIdentification();

// Export cho sử dụng
window.UserIdentification = UserIdentification;
window.userIdentification = userIdentification;