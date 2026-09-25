import { forwardRef } from 'react';
import { requireNativeComponent } from 'react-native';
import type { WebViewProps } from 'react-native-webview';

// Deve bater exatamente com REACT_CLASS em CustomWebViewManager.kt
const RCTCustomWebView = requireNativeComponent<WebViewProps>('RCTCustomWebView');

// Uso: troque <WebView ...props /> por <CustomWebView ...props /> só nas telas
// que precisam de upload de foto/vídeo dentro da WebView. Todas as outras props
// (source, onMessage, injectedJavaScript, etc.) continuam funcionando normalmente.
const CustomWebView = forwardRef<any, WebViewProps>((props, ref) => (
  <RCTCustomWebView ref={ref} {...props} />
));

CustomWebView.displayName = 'CustomWebView';

export default CustomWebView;