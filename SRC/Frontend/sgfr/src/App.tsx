import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import esES from 'antd/locale/es_ES';
import { themeConfig } from './configs/theme.config';
import { AuthProvider } from './context';
import { AppRouter } from './routes';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <AntdApp>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
