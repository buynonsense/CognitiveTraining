import { createSSRApp } from 'vue'
import App from './App.vue'

// 按需引入实际使用的组件
import WdButton from 'wot-design-uni/components/wd-button/wd-button.vue'
import WdPopup from 'wot-design-uni/components/wd-popup/wd-popup.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 仅注册必要的组件
  app.component('wd-button', WdButton)
  app.component('wd-popup', WdPopup)
  
  return { app }
}
