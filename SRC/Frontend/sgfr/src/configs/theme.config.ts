import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    colorBgContainer: '#ffffff',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
    },
    Card: {
      headerHeight: 48,
    },
    Table: {
      headerBg: '#fafafa',
    },
  },
};
