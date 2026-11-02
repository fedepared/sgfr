import React from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Space, Divider } from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageHeader } from '../../components/common';
import { ROUTES } from '../../constants/routes.constant';

const { Paragraph, Title } = Typography;

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title={`¡Bienvenido, ${user?.userName || 'Usuario'}!`}
        subtitle="Panel general del Sistema de Gestión de Flotas y Repartos (SGFR)"
        extra={
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(ROUTES.VEHICLES)}
          >
            Ir a Vehículos
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false} style={{ background: '#f0f5ff' }}>
            <Statistic
              title="Vehículos en Flota"
              value={4}
              prefix={<CarOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic
              title="Repartos Completados"
              value={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false} style={{ background: '#fffbe6' }}>
            <Statistic
              title="Entregas Pendientes"
              value={0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable bordered={false} style={{ background: '#fff0f6' }}>
            <Statistic
              title="Mantenimientos Activos"
              value={0}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Acerca del Proyecto SGFR" style={{ marginTop: 16 }}>
        <Title level={5}>Objetivo del Sistema</Title>
        <Paragraph>
          Trabajo Práctico <strong>Programación III</strong>.
          Permite coordinar vehículos, choferes, hojas de ruta y entregas de mercadería con
          seguimiento de estados y trazabilidad de eventos.
        </Paragraph>
        <Paragraph>
          Estructura base implementada:
        </Paragraph>
        <ul>
          <li><strong>Autenticación:</strong> Manejo de tokens JWT y roles (Coordinador y Chofer).</li>
          <li><strong>UI Library:</strong> Ant Design con tema configurado, alertas globales y componentes accesibles.</li>
          <li><strong>Cliente API:</strong> Axios configurado con interceptores de solicitud y respuesta.</li>
          <li><strong>Rutas:</strong> React Router con protección de rutas y layout responsive.</li>
        </ul>
        <Space style={{ marginTop: 8 }}>
          <Button type="primary" onClick={() => navigate(ROUTES.VEHICLES)}>
            Ver Flota de Autos
          </Button>
        </Space>
      </Card>
    </div>
  );
};
