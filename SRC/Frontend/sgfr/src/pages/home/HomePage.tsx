import React from 'react';
import { Row, Col, Card, Statistic, Button, Divider } from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { PageHeader } from '../../components/common';
import { ROUTES } from '../../constants/routes.constant';

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
          <Card hoverable variant='borderless' style={{ background: '#f0f5ff' }}>
            <Statistic
              title="Vehículos en Flota"
              value={4}
              prefix={<CarOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant='borderless' style={{ background: '#f6ffed' }}>
            <Statistic
              title="Repartos Completados"
              value={0}
              styles={{content: {color: '#52c41a'} }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant='borderless' style={{ background: '#fffbe6' }}>
            <Statistic
              title="Entregas Pendientes"
              value={0}
              styles={{content:{ color: '#faad14' }}}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable variant='borderless' style={{ background: '#fff0f6' }}>
            <Statistic
              title="Mantenimientos Activos"
              value={0}
              styles={{content:{ color: '#eb2f96' }}}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <section
        style={{
          marginTop: 24,
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
          borderRadius: 12,
          border: '1px solid #d6e4ff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 6px 0', color: '#1d39c4', fontSize: 18 }}>
            Acerca del Proyecto SGFR
          </h3>
          <p style={{ margin: 0, color: '#595959', fontSize: 14 }}>
            Conoce los objetivos, roles, arquitectura y estructura técnica desarrollada para Programación III.
          </p>
        </div>
        <Button
          type="primary"
          icon={<InfoCircleOutlined />}
          onClick={() => navigate(ROUTES.ABOUT)}
        >
          Ver Documentación del Proyecto
        </Button>
      </section>
    </div>
  );
};
