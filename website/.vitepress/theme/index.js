import DefaultTheme from 'vitepress/theme-without-fonts';
import SahajHome from './Home.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SahajHome', SahajHome);
  },
};
