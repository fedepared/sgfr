import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Tag, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  CarOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants/routes.constant';
import type { MenuProps } from 'antd';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: ROUTES.HOME,
      icon: <DashboardOutlined />,
      label: 'Panel Principal',
    },
    {
      key: ROUTES.VEHICLES,
      icon: <CarOutlined />,
      label: 'Vehículos',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong>{user?.userName || 'Usuario'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Rol: {user?.role || 'Invitado'}
          </Text>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: collapsed ? 16 : 18,
            letterSpacing: 1,
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          {collapsed ? 'SGFR' : '🚚 SGFR'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 48 }}
          />

          <Space orientation="horizontal" size="middle">
            {user?.role && (
              <Tag color="blue" style={{ textTransform: 'capitalize' }}>
                {user.role}
              </Tag>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <Text strong>{user?.userName || 'Usuario'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', color: '#8c8c8c' }}>
          SGFR - Sistema de Gestión de Flotas y Repartos © {new Date().getFullYear()} - Proyecto Programación III
        </Footer>
      </Layout>
    </Layout>
  );
};
