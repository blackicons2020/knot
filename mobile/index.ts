import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

if (Platform.OS === 'web') {
  window.onerror = function(msg, url, line, col, error) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:20px;z-index:99999;font-family:monospace;white-space:pre-wrap;';
    el.textContent = `ERROR: ${msg}\nFile: ${url}\nLine: ${line}:${col}\n\n${error?.stack || ''}`;
    document.body.appendChild(el);
  };
  window.onunhandledrejection = function(e) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:orange;color:black;padding:20px;z-index:99999;font-family:monospace;white-space:pre-wrap;';
    el.textContent = `UNHANDLED PROMISE: ${e.reason?.message || e.reason}\n\n${e.reason?.stack || ''}`;
    document.body.appendChild(el);
  };
}

registerRootComponent(App);
