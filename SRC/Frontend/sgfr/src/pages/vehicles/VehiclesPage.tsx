import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Input, Modal, Form, InputNumber, App } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '../../components/common';
import { vehicleService } from '../../services';
import type { Vehicle, VehicleTypeInfo, VehicleStatusInfo, CreateVehicleDTO } from '../../interfaces';

const initialMockVehicles: Vehicle[] = [
  {
    _id: '1',
    licensePlate: 'AF123CD',
    capacity: 1500,
    vehicleType: { _id: 't1', vehicleTypeName: 'Camioneta' },
    status: { _id: 's1', vehicleStatusName: 'Disponible' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    licensePlate: 'AD456EF',
    capacity: 3500,
    vehicleType: { _id: 't2', vehicleTypeName: 'Camión Ligero' },
    status: { _id: 's2', vehicleStatusName: 'En Reparto' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    licensePlate: 'AE789GH',
    capacity: 800,
    vehicleType: { _id: 't3', vehicleTypeName: 'Utilitario' },
    status: { _id: 's3', vehicleStatusName: 'En Mantenimiento' },
    createdAt: new Date().toISOString(),
  },
];

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialMockVehicles);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateVehicleDTO>();

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getAll();
      if (response?.data && response.data.length > 0) {
        setVehicles(response.data);
      } else {
        setVehicles(initialMockVehicles);
      }
    } catch {
      setVehicles(initialMockVehicles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await vehicleService.getAll();
        if (active && response?.data && response.data.length > 0) {
          setVehicles(response.data);
        }
      } catch {
        // Mantiene la lista inicial si el servidor está desconectado
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const handleCreateVehicle = async (values: CreateVehicleDTO) => {
    setSubmitting(true);
    try {
      await vehicleService.create({
        licensePlate: values.licensePlate.toUpperCase(),
        capacity: values.capacity,
        vehicleTypeId: values.vehicleTypeId || 't1',
      });
      message.success('Vehículo creado correctamente en el servidor');
      setIsModalOpen(false);
      form.resetFields();
      void fetchVehicles();
    } catch {
      const newMockVehicle: Vehicle = {
        _id: String(Date.now()),
        licensePlate: values.licensePlate.toUpperCase(),
        capacity: values.capacity,
        vehicleType: { _id: 't1', vehicleTypeName: 'Utilitario' },
        status: { _id: 's1', vehicleStatusName: 'Disponible' },
        createdAt: new Date().toISOString(),
      };
      setVehicles((prev) => [newMockVehicle, ...prev]);
      message.success('Vehículo agregado a la lista localmente');
      setIsModalOpen(false);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'disponible':
        return 'success';
      case 'en reparto':
        return 'processing';
      case 'en mantenimiento':
        return 'warning';
      case 'fuera de servicio':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeName = (type: VehicleTypeInfo | string): string => {
    if (typeof type === 'string') return type;
    return type?.vehicleTypeName || 'General';
  };

  const getStatusText = (status: VehicleStatusInfo | string): string => {
    if (typeof status === 'string') return status;
    return status?.vehicleStatusName || 'Disponible';
  };

  const filteredVehicles = vehicles.filter((v) =>
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<Vehicle> = [
    {
      title: 'Patente / Matrícula',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      render: (text: string) => (
        <Space>
          <CarOutlined style={{ color: '#1677ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Tipo de Vehículo',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (type: VehicleTypeInfo | string) => getTypeName(type),
    },
    {
      title: 'Capacidad (kg)',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => `${capacity.toLocaleString()} kg`,
      sorter: (a, b) => a.capacity - b.capacity,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: VehicleStatusInfo | string) => {
        const text = getStatusText(status);
        return <Tag color={getStatusColor(text)}>{text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Vehículos"
        subtitle="Administración del parque automotor y disponibilidad de la flota"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void fetchVehicles()} loading={loading}>
              Refrescar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Nuevo Vehículo
            </Button>
          </Space>
        }
      />

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar por patente..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        </Space>

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredVehicles}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title="Registrar Nuevo Vehículo"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form<CreateVehicleDTO>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleCreateVehicle(values)}
          initialValues={{ capacity: 1000 }}
        >
          <Form.Item
            name="licensePlate"
            label="Patente / Matrícula"
            rules={[
              { required: true, message: 'La patente es obligatoria' },
              { min: 6, message: 'Mínimo 6 caracteres' },
            ]}
          >
            <Input placeholder="Ej: AF123CD" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacidad de Carga (kg)"
            rules={[{ required: true, message: 'La capacidad es obligatoria' }]}
          >
            <InputNumber min={50} max={50000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Guardar Vehículo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
