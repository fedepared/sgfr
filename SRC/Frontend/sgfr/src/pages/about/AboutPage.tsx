import React from 'react';
import { Typography, Row, Col, Button, Tag, Space, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  ApiOutlined,
  RocketOutlined,
  CarOutlined,
  LoginOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../constants/routes.constant';

const { Title, Paragraph, Text } = Typography;

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <article
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '32px 24px 48px',
      }}
    >
      {/* Header de navegación contextual */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN)}
        >
          {isAuthenticated ? 'Volver al Inicio' : 'Volver al Login'}
        </Button>

        <Space>
          <Tag color="processing">Programación III</Tag>
          <Tag color="success">TP Final</Tag>
        </Space>
      </header>

      {/* Hero Section */}
      <section style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={1} style={{ marginBottom: 12, color: '#1677ff' }}>
          🚚 SGFR
        </Title>
        <Title level={2} style={{ marginTop: 0, fontWeight: 400, color: '#434343' }}>
          Sistema de Gestión de Flota y Reparto
        </Title>
        <Paragraph
          style={{
            fontSize: 18,
            color: '#595959',
            maxWidth: 720,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Plataforma web integral orientada a la logística y distribución, diseñada para optimizar
          la trazabilidad de entregas, la disponibilidad del parque automotor y la coordinación del equipo de choferes.
        </Paragraph>
      </section>

      <Divider />

      {/* Objetivo del Sistema */}
      <section style={{ marginBottom: 40 }}>
        <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RocketOutlined style={{ color: '#1677ff' }} />
          Objetivo del Sistema
        </Title>
        <Paragraph style={{ fontSize: 16, lineHeight: 1.7, color: '#262626' }}>
          Esta aplicación forma parte del Trabajo Práctico de <strong>Programación III</strong>.
          Permite coordinar vehículos, choferes, hojas de ruta y entregas de mercadería con
          seguimiento de estados y trazabilidad en tiempo real de todos los eventos del proceso de distribución.
        </Paragraph>
      </section>

      {/* Estructura Base y Arquitectura */}
      <section style={{ marginBottom: 40 }}>
        <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <ApartmentOutlined style={{ color: '#1677ff' }} />
          Estructura Base Implementada
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <section
              style={{
                height: '100%',
                padding: 20,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            >
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
                <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                Autenticación y Seguridad
              </Title>
              <Paragraph style={{ color: '#595959', marginBottom: 0 }}>
                Manejo de tokens <strong>JWT</strong> almacenados de forma segura con control de acceso
                basado en roles (<strong>Coordinador</strong> y <strong>Chofer</strong>), junto con interceptores
                para expiración de credenciales.
              </Paragraph>
            </section>
          </Col>

          <Col xs={24} md={12}>
            <section
              style={{
                height: '100%',
                padding: 20,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            >
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
                <CheckCircleFilled style={{ color: '#1677ff' }} />
                UI Library & Experiencia de Usuario
              </Title>
              <Paragraph style={{ color: '#595959', marginBottom: 0 }}>
                Desarrollado con <strong>Ant Design (antd)</strong>, personalización de temas corporativos,
                localización en español (`es_ES`), feedback visual inmediato y diseño completamente responsive.
              </Paragraph>
            </section>
          </Col>

          <Col xs={24} md={12}>
            <section
              style={{
                height: '100%',
                padding: 20,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            >
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
                <ApiOutlined style={{ color: '#722ed1' }} />
                Cliente API & Comunicación Asíncrona
              </Title>
              <Paragraph style={{ color: '#595959', marginBottom: 0 }}>
                Capa de servicios centralizada con <strong>Axios</strong>, inyección automática de cabeceras
                de autorización y manejo estandarizado de errores tanto de red como de reglas de negocio.
              </Paragraph>
            </section>
          </Col>

          <Col xs={24} md={12}>
            <section
              style={{
                height: '100%',
                padding: 20,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
              }}
            >
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}>
                <RocketOutlined style={{ color: '#fa8c16' }} />
                Rutas y Control de Navegación
              </Title>
              <Paragraph style={{ color: '#595959', marginBottom: 0 }}>
                Enrutamiento SPA con <strong>React Router</strong>, layout interactivo con barra lateral,
                guards de protección de rutas privadas y pantallas de contingencia 404.
              </Paragraph>
            </section>
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Footer / Acciones */}
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginTop: 24,
        }}
      >
        <div>
          <Text type="secondary">
            Desarrollado para la cátedra de Programación III © {new Date().getFullYear()}
          </Text>
        </div>

        <Space>
          {isAuthenticated ? (
            <>
              <Button onClick={() => navigate(ROUTES.HOME)} icon={<DashboardOutlined />}>
                Panel Principal
              </Button>
              <Button type="primary" onClick={() => navigate(ROUTES.VEHICLES)} icon={<CarOutlined />}>
                Ver Flota de Vehículos
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate(ROUTES.LOGIN)} icon={<LoginOutlined />}>
              Iniciar Sesión
            </Button>
          )}
        </Space>
      </footer>
    </article>
  );
};
