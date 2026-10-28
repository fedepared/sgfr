import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, App } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants/routes.constant';
import type { LoginCredentials } from '../../interfaces';

const { Title, Text } = Typography;

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || ROUTES.HOME;

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(values);
      message.success('¡Bienvenido al sistema!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Error al iniciar sesión. Verifica tus credenciales.';
      setErrorMsg(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 4, color: '#1677ff' }}>
            SGFR
          </Title>
          <Text type="secondary">Sistema de Gestión de Flota y Reparto</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form<LoginCredentials>
          name="loginForm"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="userName"
            rules={[{ required: true, message: 'Por favor ingrese su usuario' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Usuario" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<LoginOutlined />}
              loading={loading}
              block
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Space orientation="vertical" size={2}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Trabajo Práctico Final - Programación III
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};
