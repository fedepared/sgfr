import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Card,
  Input,
  Modal,
  Form,
  InputNumber,
  App,
  Select,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CarOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PageHeader } from '../../components/common';
import { vehicleService } from '../../services';
import { useAuth } from '../../hooks';
import { ROLES } from '../../constants/roles.constant';
import {
  VEHICLE_TYPES,
  VEHICLE_STATUSES,
  type Vehicle,
  type VehicleType,
  type VehicleStatus,
  type CreateVehicleDTO,
} from '../../interfaces';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState<{ current: number; pageSize: number; total: number }>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateVehicleDTO>();

  const isCoordinator = user?.role === ROLES.COORDINATOR;

  const fetchVehicles = useCallback(
    async (
      page: number,
      limit: number,
      search = searchTerm,
      status = selectedStatus,
      type = selectedType
    ) => {
      setLoading(true);
      try {
        const response = await vehicleService.getAll({
          page,
          limit,
          search: search.trim() || undefined,
          status: status || undefined,
          vehicleType: type || undefined,
        });

        if (response?.data) {
          setVehicles(response.data);
          if (response.pagination) {
            setPagination({
              current: response.pagination.currentPage,
              pageSize: response.pagination.limit,
              total: response.pagination.totalItems,
            });
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al conectar con la base de datos de vehículos.';
        message.error(errorMessage);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedStatus, selectedType, message]
  );

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      setLoading(true);
      try {
        const response = await vehicleService.getAll({
          page: 1,
          limit: 10,
          search: searchTerm.trim() || undefined,
          status: selectedStatus || undefined,
          vehicleType: selectedType || undefined,
        });

        if (active && response?.data) {
          setVehicles(response.data);
          if (response.pagination) {
            setPagination({
              current: response.pagination.currentPage,
              pageSize: response.pagination.limit,
              total: response.pagination.totalItems,
            });
          }
        }
      } catch (err: unknown) {
        if (active) {
          const errorMessage =
            err instanceof Error ? err.message : 'Error al conectar con la base de datos de vehículos.';
          message.error(errorMessage);
          setVehicles([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    return () => {
      active = false;
    };
  }, [selectedStatus, selectedType, message, searchTerm]);

  const handleSearch = () => {
    void fetchVehicles(1, pagination.pageSize, searchTerm, selectedStatus, selectedType);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    const nextCurrent = newPagination.current || 1;
    const nextPageSize = newPagination.pageSize || 10;
    void fetchVehicles(nextCurrent, nextPageSize, searchTerm, selectedStatus, selectedType);
  };

  const handleCreateVehicle = async (values: CreateVehicleDTO) => {
    setSubmitting(true);
    try {
      await vehicleService.create({
        licensePlate: values.licensePlate.trim().toUpperCase(),
        capacity: Number(values.capacity),
        vehicleType: values.vehicleType,
        status: values.status,
      });

      message.success('Vehículo registrado exitosamente en la base de datos.');
      setIsModalOpen(false);
      form.resetFields();
      void fetchVehicles(1, pagination.pageSize);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'No se pudo registrar el vehículo.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await vehicleService.delete(id);
      message.success('Vehículo eliminado exitosamente.');
      void fetchVehicles(pagination.current, pagination.pageSize);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al eliminar el vehículo.';
      message.error(errorMsg);
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Disponible':
        return 'success';
      case 'En ruta':
        return 'processing';
      case 'En mantenimiento':
        return 'warning';
      case 'Fuera de servicio':
        return 'error';
      default:
        return 'default';
    }
  };

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
      render: (type: VehicleType) => <Tag>{type}</Tag>,
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
      render: (status: VehicleStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    ...(isCoordinator
      ? [
          {
            title: 'Acciones',
            key: 'actions',
            render: (_: unknown, record: Vehicle) => (
              <Popconfirm
                title="¿Eliminar vehículo?"
                description={`¿Estás seguro de que deseas eliminar el vehículo ${record.licensePlate}?`}
                onConfirm={() => void handleDeleteVehicle(record._id)}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Eliminar
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Vehículos"
        subtitle="Administración del parque automotor y disponibilidad de la flota en base de datos"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void fetchVehicles(pagination.current, pagination.pageSize)}
              loading={loading}
            >
              Refrescar
            </Button>
            {isCoordinator && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Nuevo Vehículo
              </Button>
            )}
          </Space>
        }
      />

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar por patente..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 220 }}
            allowClear
          />

          <Select
            placeholder="Filtrar por tipo"
            allowClear
            style={{ width: 170 }}
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
            options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))}
          />

          <Select
            placeholder="Filtrar por estado"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={VEHICLE_STATUSES.map((s) => ({ label: s, value: s }))}
          />

          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Buscar
          </Button>
        </Space>

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={vehicles}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total: ${total} vehículos`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Registrar Nuevo Vehículo"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form<CreateVehicleDTO>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleCreateVehicle(values)}
          initialValues={{
            vehicleType: 'Camion',
            status: 'Disponible',
            capacity: 1000,
          }}
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
            name="vehicleType"
            label="Tipo de Vehículo"
            rules={[{ required: true, message: 'El tipo de vehículo es obligatorio' }]}
          >
            <Select
              options={VEHICLE_TYPES.map((type) => ({
                label: type,
                value: type,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Estado Inicial"
            rules={[{ required: true, message: 'El estado es obligatorio' }]}
          >
            <Select
              options={VEHICLE_STATUSES.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacidad de Carga (kg)"
            rules={[
              { required: true, message: 'La capacidad es obligatoria' },
              {
                type: 'number',
                min: 0,
                message: 'Debe ser un número mayor o igual a 0',
              },
            ]}
          >
            <InputNumber min={0} max={100000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancelar
              </Button>
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
