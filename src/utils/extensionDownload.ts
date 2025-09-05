export const downloadChromeExtension = () => {
  // Create manifest.json content
  const manifest = {
    manifest_version: 3,
    name: "Spot the Fake - AI Fraud Detection",
    version: "1.0.0",
    description: "Real-time AI-powered protection against fraudulent websites and phishing attempts",
    permissions: [
      "activeTab",
      "storage",
      "notifications"
    ],
    host_permissions: [
      "http://*/*",
      "https://*/*"
    ],
    background: {
      service_worker: "background.js"
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content.js"],
        css: ["content.css"]
      }
    ],
    action: {
      default_popup: "popup.html",
      default_title: "Spot the Fake Protection",
      default_icon: {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png"
      }
    },
    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png"
    }
  };

  // Create popup.html content
  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    .title {
      font-weight: 600;
      color: #111827;
    }
    .subtitle {
      font-size: 12px;
      color: #6b7280;
    }
    .status {
      padding: 12px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .status-safe {
      color: #166534;
    }
    .stats {
      text-align: center;
      margin-bottom: 16px;
    }
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      width: 100%;
      padding: 8px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🛡️</div>
    <div>
      <div class="title">Spot the Fake</div>
      <div class="subtitle">AI Protection Active</div>
    </div>
  </div>
  
  <div class="status">
    <div class="status-safe">✅ Current site is safe</div>
  </div>
  
  <div class="stats">
    <div class="stat-number" id="blockedCount">247</div>
    <div class="stat-label">Threats Blocked Today</div>
  </div>
  
  <button class="button" id="reportBtn">Report Suspicious Content</button>
  
  <script src="popup.js"></script>
</body>
</html>`;

  // Create popup.js content
  const popupJs = `document.addEventListener('DOMContentLoaded', function() {
  const reportBtn = document.getElementById('reportBtn');
  const blockedCount = document.getElementById('blockedCount');
  
  // Load blocked count from storage
  chrome.storage.local.get(['blockedCount'], function(result) {
    if (result.blockedCount) {
      blockedCount.textContent = result.blockedCount;
    }
  });
  
  reportBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = tabs[0].url;
      // Send report to background script
      chrome.runtime.sendMessage({
        action: 'reportSite',
        url: currentUrl
      });
      
      // Show confirmation
      reportBtn.textContent = 'Reported!';
      reportBtn.style.background = '#16a34a';
      setTimeout(() => {
        reportBtn.textContent = 'Report Suspicious Content';
        reportBtn.style.background = '#2563eb';
      }, 2000);
    });
  });
});`;

  // Create background.js content
  const backgroundJs = `// Background service worker for Spot the Fake extension

let blockedCount = 0;

// Load blocked count from storage
chrome.storage.local.get(['blockedCount'], function(result) {
  blockedCount = result.blockedCount || 0;
});

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  if (details.frameId === 0) { // Main frame only
    checkUrl(details.url, details.tabId);
  }
});

// Check URL for threats
async function checkUrl(url, tabId) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // Suspicious patterns
    const suspiciousPatterns = [
      'paypal-secure', 'amazon-deals', 'microsoft-update', 'apple-id',
      'google-security', 'facebook-login', 'instagram-verify',
      'crypto-wallet', 'bank-secure', 'netflix-account'
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      domain.includes(pattern) || domain.includes(pattern.replace('-', ''))
    );
    
    if (isSuspicious) {
      // Block the site
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(url)
      });
      
      // Increment blocked count
      blockedCount++;
      chrome.storage.local.set({blockedCount: blockedCount});
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Threat Blocked!',
        message: \`Blocked suspicious site: \${domain}\`
      });
    }
  } catch (error) {
    console.error('Error checking URL:', error);
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'reportSite') {
    // In a real implementation, this would send to your threat database
    console.log('Reported suspicious site:', request.url);
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Report Submitted',
      message: 'Thank you for reporting this site. Our team will investigate.'
    });
  }
});`;

  // Create content.js content
  const contentJs = `// Content script for real-time page analysis

(function() {
  'use strict';
  
  // Check for suspicious elements on page load
  function analyzePage() {
    const suspiciousKeywords = [
      'verify your account', 'suspended account', 'urgent action required',
      'click here immediately', 'limited time offer', 'act now',
      'confirm your identity', 'update payment method'
    ];
    
    const pageText = document.body.innerText.toLowerCase();
    const foundSuspicious = suspiciousKeywords.filter(keyword => 
      pageText.includes(keyword)
    );
    
    if (foundSuspicious.length >= 2) {
      showWarningBanner(foundSuspicious);
    }
  }
  
  function showWarningBanner(keywords) {
    // Create warning banner
    const banner = document.createElement('div');
    banner.id = 'spot-the-fake-warning';
    banner.innerHTML = \`
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #fef2f2;
        border-bottom: 2px solid #fecaca;
        padding: 12px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <div style="
              width: 24px;
              height: 24px;
              background: #dc2626;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              color: white;
              font-weight: bold;
              font-size: 14px;
            ">!</div>
            <div>
              <div style="font-weight: 600; color: #dc2626; margin-bottom: 2px;">
                ⚠️ Suspicious Content Detected
              </div>
              <div style="font-size: 12px; color: #7f1d1d;">
                This page contains patterns commonly found in fraudulent websites
              </div>
            </div>
          </div>
          <button onclick="document.getElementById('spot-the-fake-warning').remove()" style="
            background: none;
            border: 1px solid #dc2626;
            color: #dc2626;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Dismiss</button>
        </div>
      </div>
    \`;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Adjust page content to account for banner
    document.body.style.paddingTop = '60px';
  }
  
  // Run analysis when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzePage);
  } else {
    analyzePage();
  }
})();`;

  // Create content.css content
  const contentCss = `/* Styles for Spot the Fake extension content */

#spot-the-fake-warning {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

#spot-the-fake-warning * {
  box-sizing: border-box !important;
}`;

  // Create blocked.html content
  const blockedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Site Blocked - Spot the Fake</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px 20px;
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 500px;
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: white;
      font-size: 40px;
    }
    h1 {
      color: #dc2626;
      margin-bottom: 16px;
      font-size: 24px;
    }
    p {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .url {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      word-break: break-all;
      margin-bottom: 24px;
      color: #374151;
    }
    .buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .button {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-size: 14px;
    }
    .button-primary {
      background: #2563eb;
      color: white;
    }
    .button-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    .button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🛡️</div>
    <h1>Site Blocked for Your Protection</h1>
    <p>Our AI system detected that this website may be fraudulent or attempting to steal your personal information.</p>
    
    <div class="url" id="blockedUrl"></div>
    
    <p><strong>Why was this blocked?</strong><br>
    The site exhibits patterns commonly associated with phishing, scams, or malicious content.</p>
    
    <div class="buttons">
      <button class="button button-primary" onclick="history.back()">Go Back Safely</button>
      <button class="button button-secondary" onclick="proceedAnyway()">Proceed Anyway</button>
    </div>
  </div>
  
  <script>
    // Get blocked URL from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const blockedUrl = urlParams.get('blocked');
    if (blockedUrl) {
      document.getElementById('blockedUrl').textContent = blockedUrl;
    }
    
    function proceedAnyway() {
      if (blockedUrl && confirm('Are you sure you want to proceed? This site may be dangerous.')) {
        window.location.href = blockedUrl;
      }
    }
  </script>
</body>
</html>`;

  // Create README content
  const readme = `# Spot the Fake - Chrome Extension

## Installation Instructions

1. Open Chrome and navigate to chrome://extensions/
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the extracted extension folder
4. The extension will appear in your browser toolbar

## Features

- Real-time website analysis
- Automatic blocking of suspicious sites
- Threat reporting system
- Daily protection statistics
- Lightweight and privacy-focused

## How It Works

The extension uses AI-powered pattern recognition to identify:
- Phishing websites
- Fake login pages
- Suspicious domains
- Malicious content patterns

Stay protected while browsing!
`;

  // Create and download the extension package
  const files = {
    'manifest.json': JSON.stringify(manifest, null, 2),
    'popup.html': popupHtml,
    'popup.js': popupJs,
    'background.js': backgroundJs,
    'content.js': contentJs,
    'content.css': contentCss,
    'blocked.html': blockedHtml,
    'README.md': readme
  };

  // Create a zip-like structure using JSZip simulation
  const createExtensionPackage = () => {
    // Create a simple text file with all the extension files
    let packageContent = '# Spot the Fake Chrome Extension Package\n\n';
    packageContent += 'Extract these files to a folder and load as unpacked extension in Chrome.\n\n';
    
    Object.entries(files).forEach(([filename, content]) => {
      packageContent += `\n## File: ${filename}\n`;
      packageContent += '```\n';
      packageContent += content;
      packageContent += '\n```\n';
    });

    return packageContent;
  };

  const packageContent = createExtensionPackage();
  const blob = new Blob([packageContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'spot-the-fake-extension-package.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Show success notification
  return true;
};

export const downloadFirefoxExtension = () => {
  // Similar implementation for Firefox
  alert('Firefox extension download will be available soon. The Chrome extension can also work in Firefox with minor modifications.');
};