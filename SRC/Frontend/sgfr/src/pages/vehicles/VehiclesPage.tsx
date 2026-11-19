import React, { useState, useMemo, useEffect } from 'react';
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
  Tooltip,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CarOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PageHeader } from '../../components/common';
import { vehicleService } from '../../services';
import { useAuth, useFetch } from '../../hooks';
import { ROLES } from '../../constants/roles.constant';
import { env } from '../../configs/env.config';
import {
  VEHICLE_TYPES,
  VEHICLE_STATUSES,
  type Vehicle,
  type VehicleType,
  type VehicleStatus,
  type CreateVehicleDTO,
  type UpdateVehicleDTO,
  type PaginatedResponse,
} from '../../interfaces';

export const VehiclesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Estados de Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateVehicleDTO>();

  const isCoordinator = user?.role === ROLES.COORDINATOR;

  // URL dinámica para el hook useFetch
  const vehiclesUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));

    if (appliedSearch.trim()) {
      params.set('search', appliedSearch.trim());
    }
    if (selectedStatus) {
      params.set('status', selectedStatus);
    }
    if (selectedType) {
      params.set('vehicleType', selectedType);
    }

    return `${env.API_BASE_URL}/vehicles?${params.toString()}`;
  }, [currentPage, pageSize, appliedSearch, selectedStatus, selectedType]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Vehicle>>(vehiclesUrl);

  const vehicles = data?.data || [];
  const paginationInfo = data?.pagination;

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Error al conectar con la base de datos de vehículos.');
    }
  }, [error, message]);

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setSelectedStatus(undefined);
    setSelectedType(undefined);
    setCurrentPage(1);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    if (newPagination.current) {
      setCurrentPage(newPagination.current);
    }
    if (newPagination.pageSize) {
      setPageSize(newPagination.pageSize);
    }
  };

  // Abrir modal de Alta (Crear)
  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    form.resetFields();
    form.setFieldsValue({
      vehicleType: 'Camion',
      status: 'Disponible',
      capacity: 1000,
    });
    setIsFormModalOpen(true);
  };

  // Abrir modal de Modificación (Editar)
  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity,
      status: vehicle.status,
    });
    setIsFormModalOpen(true);
  };

  // Guardar (Alta o Modificación)
  const handleFormSubmit = async (values: CreateVehicleDTO) => {
    setSubmitting(true);
    try {
      const payload = {
        licensePlate: values.licensePlate.trim().toUpperCase(),
        capacity: Number(values.capacity),
        vehicleType: values.vehicleType,
        status: values.status,
      };

      if (editingVehicle) {
        // Modificación (PUT)
        await vehicleService.update(editingVehicle._id, payload as UpdateVehicleDTO);
        message.success(`Vehículo ${payload.licensePlate} actualizado exitosamente.`);
      } else {
        // Alta (POST)
        await vehicleService.create(payload);
        message.success(`Vehículo ${payload.licensePlate} registrado exitosamente.`);
      }

      setIsFormModalOpen(false);
      form.resetFields();
      setEditingVehicle(null);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al procesar la operación con el vehículo.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Baja (Eliminar)
  const handleDeleteVehicle = async (id: string, plate: string) => {
    try {
      await vehicleService.delete(id);
      message.success(`Vehículo ${plate} eliminado exitosamente.`);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al eliminar el vehículo.';
      message.error(errorMsg);
    }
  };

  // Cambio rápido de estado desde la tabla
  const handleQuickStatusChange = async (vehicle: Vehicle, newStatus: VehicleStatus) => {
    try {
      await vehicleService.updateStatus(vehicle._id, newStatus);
      message.success(`Estado de ${vehicle.licensePlate} actualizado a ${newStatus}.`);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'No se pudo actualizar el estado del vehículo.';
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
      render: (type: VehicleType) => <Tag color="blue">{type}</Tag>,
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
      render: (status: VehicleStatus, record: Vehicle) => {
        if (!isCoordinator) {
          return <Tag color={getStatusColor(status)}>{status}</Tag>;
        }

        // Si es coordinador, permite cambiar rápidamente el estado en línea
        return (
          <Select
            size="small"
            value={status}
            onChange={(val) => void handleQuickStatusChange(record, val)}
            style={{ width: 150 }}
            options={VEHICLE_STATUSES.map((s) => ({
              label: (
                <Space orientation="horizontal" size={4}>
                  <Tag color={getStatusColor(s)} style={{ margin: 0, padding: '0 4px', fontSize: 11 }}>
                    {s}
                  </Tag>
                </Space>
              ),
              value: s,
            }))}
          />
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: Vehicle) => (
        <Space orientation="horizontal" size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setViewingVehicle(record)}
            />
          </Tooltip>

          {isCoordinator && (
            <>
              <Tooltip title="Editar vehículo">
                <Button
                  type="text"
                  icon={<EditOutlined style={{ color: '#1677ff' }} />}
                  onClick={() => handleOpenEditModal(record)}
                />
              </Tooltip>

              <Tooltip title="Eliminar vehículo">
                <Popconfirm
                  title="¿Eliminar vehículo?"
                  description={`¿Estás seguro de que deseas eliminar el vehículo ${record.licensePlate}?`}
                  onConfirm={() => void handleDeleteVehicle(record._id, record.licensePlate)}
                  okText="Sí, eliminar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Vehículos"
        subtitle="Alta, baja, modificación y control de disponibilidad de la flota automotriz"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void refetch()}
              loading={loading}
            >
              Refrescar
            </Button>
            {isCoordinator && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreateModal}
              >
                Nuevo Vehículo
              </Button>
            )}
          </Space>
        }
      />

      <Card>
        {/* Barra de Filtros y Búsqueda */}
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
            onChange={(val) => {
              setSelectedType(val);
              setCurrentPage(1);
            }}
            options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))}
          />

          <Select
            placeholder="Filtrar por estado"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            options={VEHICLE_STATUSES.map((s) => ({ label: s, value: s }))}
          />

          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Buscar
          </Button>

          {(appliedSearch || selectedStatus || selectedType) && (
            <Button onClick={handleResetFilters}>
              Limpiar Filtros
            </Button>
          )}
        </Space>

        {/* Tabla Principal */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={vehicles}
          loading={loading}
          pagination={{
            current: paginationInfo?.currentPage || currentPage,
            pageSize: paginationInfo?.limit || pageSize,
            total: paginationInfo?.totalItems || 0,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total: ${total} vehículos`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal de Alta / Modificación */}
      <Modal
        title={editingVehicle ? `Modificar Vehículo: ${editingVehicle.licensePlate}` : 'Registrar Nuevo Vehículo'}
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          form.resetFields();
          setEditingVehicle(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form<CreateVehicleDTO>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleFormSubmit(values)}
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
            <Input placeholder="Ej: AF123CD" style={{ textTransform: 'uppercase' }} />
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
            label="Estado del Vehículo"
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
                  setIsFormModalOpen(false);
                  form.resetFields();
                  setEditingVehicle(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingVehicle ? 'Guardar Cambios' : 'Registrar Vehículo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Detalle / Consulta */}
      <Modal
        title={`Detalle de Vehículo - ${viewingVehicle?.licensePlate || ''}`}
        open={Boolean(viewingVehicle)}
        onCancel={() => setViewingVehicle(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewingVehicle(null)}>
            Cerrar
          </Button>,
        ]}
      >
        {viewingVehicle && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Identificador Mongo">
              <code>{viewingVehicle._id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Patente / Matrícula">
              <strong>{viewingVehicle.licensePlate}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Vehículo">
              <Tag color="blue">{viewingVehicle.vehicleType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Capacidad Máxima">
              {viewingVehicle.capacity.toLocaleString()} kg
            </Descriptions.Item>
            <Descriptions.Item label="Estado Actual">
              <Tag color={getStatusColor(viewingVehicle.status)}>{viewingVehicle.status}</Tag>
            </Descriptions.Item>
            {viewingVehicle.createdAt && (
              <Descriptions.Item label="Fecha de Alta">
                {new Date(viewingVehicle.createdAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {viewingVehicle.updatedAt && (
              <Descriptions.Item label="Última Modificación">
                {new Date(viewingVehicle.updatedAt).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};
