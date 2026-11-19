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
  List,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CompassOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PageHeader } from '../../components/common';
import { deliveryService } from '../../services';
import { useFetch } from '../../hooks';
import { env } from '../../configs/env.config';
import {
  DELIVERY_STATUSES,
  TIME_RANGES,
  type Delivery,
  type DeliveryStatus,
  type TimeRange,
  type CreateDeliveryDTO,
  type UpdateDeliveryDTO,
  type Customer,
  type PaginatedResponse,
} from '../../interfaces';

export const DeliveriesPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Estados de Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [viewingDelivery, setViewingDelivery] = useState<Delivery | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { message } = App.useApp();
  const [form] = Form.useForm<CreateDeliveryDTO>();

  // Cargar clientes disponibles para selectores usando useFetch
  const { data: customersResponse } = useFetch<PaginatedResponse<Customer>>(
    `${env.API_BASE_URL}/customers?limit=100`
  );
  const customersList = useMemo(() => customersResponse?.data || [], [customersResponse]);

  // URL dinámica para entregas
  const deliveriesUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));

    if (selectedStatus) {
      params.set('status', selectedStatus);
    }
    if (selectedTimeRange) {
      params.set('timeRange', selectedTimeRange);
    }
    if (selectedCustomer) {
      params.set('customer', selectedCustomer);
    }

    return `${env.API_BASE_URL}/deliveries?${params.toString()}`;
  }, [currentPage, pageSize, selectedStatus, selectedTimeRange, selectedCustomer]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Delivery>>(deliveriesUrl);

  const deliveries = data?.data || [];
  const paginationInfo = data?.pagination;

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Error al conectar con la base de datos de entregas.');
    }
  }, [error, message]);

  const handleResetFilters = () => {
    setSelectedStatus(undefined);
    setSelectedTimeRange(undefined);
    setSelectedCustomer(undefined);
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

  // Abrir modal de Alta
  const handleOpenCreateModal = () => {
    setEditingDelivery(null);
    form.resetFields();
    form.setFieldsValue({
      timeRange: '8:00 a 13:00',
      status: 'Creado',
      distance: 5,
    });
    setIsFormModalOpen(true);
  };

  // Abrir modal de Edición
  const handleOpenEditModal = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    const customerId =
      typeof delivery.customer === 'string' ? delivery.customer : delivery.customer._id;

    form.setFieldsValue({
      customer: customerId,
      address: delivery.address,
      timeRange: delivery.timeRange,
      status: delivery.status,
      distance: delivery.distance,
    });
    setIsFormModalOpen(true);
  };

  // Autocompletar dirección al seleccionar cliente en el alta
  const handleCustomerChange = (customerId: string) => {
    const selected = customersList.find((c) => c._id === customerId);
    if (selected && selected.addresses && selected.addresses.length > 0) {
      const mainAddr = selected.addresses[0];
      const addrString = `${mainAddr.street}${mainAddr.floor ? `, Piso ${mainAddr.floor}` : ''}${
        mainAddr.dept ? ` Depto ${mainAddr.dept}` : ''
      }${mainAddr.zipCode ? ` (CP ${mainAddr.zipCode})` : ''}`;
      form.setFieldValue('address', addrString);
    }
  };

  // Guardar entrega
  const handleFormSubmit = async (values: CreateDeliveryDTO) => {
    setSubmitting(true);
    try {
      if (editingDelivery) {
        const updatePayload: UpdateDeliveryDTO = {
          address: values.address.trim(),
          timeRange: values.timeRange,
          status: values.status,
          distance: Number(values.distance),
        };
        await deliveryService.update(editingDelivery._id, updatePayload);
        message.success('Entrega actualizada exitosamente.');
      } else {
        const createPayload: CreateDeliveryDTO = {
          customer: values.customer,
          address: values.address.trim(),
          timeRange: values.timeRange,
          status: values.status || 'Creado',
          distance: Number(values.distance),
        };
        await deliveryService.create(createPayload);
        message.success('Entrega creada exitosamente.');
      }

      setIsFormModalOpen(false);
      form.resetFields();
      setEditingDelivery(null);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al procesar la entrega.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar entrega
  const handleDeleteDelivery = async (id: string) => {
    try {
      await deliveryService.delete(id);
      message.success('Entrega eliminada con éxito.');
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al eliminar la entrega.';
      message.error(errorMsg);
    }
  };

  // Actualización rápida de estado
  const handleQuickStatusChange = async (delivery: Delivery, newStatus: DeliveryStatus) => {
    try {
      await deliveryService.updateStatus(delivery._id, { status: newStatus });
      message.success(`Estado actualizado a ${newStatus}.`);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'No se pudo actualizar el estado de la entrega.';
      message.error(errorMsg);
    }
  };

  const getStatusTag = (status: DeliveryStatus) => {
    switch (status) {
      case 'Creado':
        return <Tag color="default">Creado</Tag>;
      case 'En Preparación':
        return <Tag color="blue" icon={<SyncOutlined spin />}>En Preparación</Tag>;
      case 'En camino':
        return <Tag color="processing" icon={<CompassOutlined />}>En camino</Tag>;
      case 'Entregado':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Entregado</Tag>;
      case 'Fallo en la entrega':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Fallo en la entrega</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getCustomerName = (cust: Customer | string | undefined): string => {
    if (!cust) return 'Cliente no disponible';
    if (typeof cust === 'string') return cust;
    return `${cust.lastName}, ${cust.name}`;
  };

  const columns: ColumnsType<Delivery> = [
    {
      title: 'Cliente',
      dataIndex: 'customer',
      key: 'customer',
      render: (cust: Customer | string) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <strong>{getCustomerName(cust)}</strong>
        </Space>
      ),
    },
    {
      title: 'Dirección de Destino',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Tooltip title={address}>
          <span style={{ maxWidth: 260, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Franja Horaria',
      dataIndex: 'timeRange',
      key: 'timeRange',
      render: (time: TimeRange) => (
        <Tag icon={<ClockCircleOutlined />} color="purple">
          {time}
        </Tag>
      ),
    },
    {
      title: 'Distancia',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance: number) => `${distance} km`,
      sorter: (a, b) => a.distance - b.distance,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: DeliveryStatus, record: Delivery) => (
        <Select
          size="small"
          value={status}
          onChange={(val) => void handleQuickStatusChange(record, val)}
          style={{ width: 165 }}
          options={DELIVERY_STATUSES.map((s) => ({
            label: getStatusTag(s),
            value: s,
          }))}
        />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: Delivery) => (
        <Space orientation="horizontal" size="small">
          <Tooltip title="Ver detalles">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setViewingDelivery(record)}
            />
          </Tooltip>

          <Tooltip title="Editar entrega">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Tooltip title="Eliminar entrega">
            <Popconfirm
              title="¿Eliminar entrega?"
              description="¿Estás seguro de que deseas eliminar esta entrega?"
              onConfirm={() => void handleDeleteDelivery(record._id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Entregas"
        subtitle="Administración logística de pedidos, franjas horarias y seguimiento de estados"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void refetch()}
              loading={loading}
            >
              Refrescar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              Nueva Entrega
            </Button>
          </Space>
        }
      />

      <Card>
        {/* Barra de Filtros */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filtrar por Cliente"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: 220 }}
            value={selectedCustomer}
            onChange={(val) => {
              setSelectedCustomer(val);
              setCurrentPage(1);
            }}
            options={customersList.map((c) => ({
              label: `${c.lastName}, ${c.name} (${c.idCard})`,
              value: c._id,
            }))}
          />

          <Select
            placeholder="Filtrar por Franja Horaria"
            allowClear
            style={{ width: 190 }}
            value={selectedTimeRange}
            onChange={(val) => {
              setSelectedTimeRange(val);
              setCurrentPage(1);
            }}
            options={TIME_RANGES.map((t) => ({ label: t, value: t }))}
          />

          <Select
            placeholder="Filtrar por Estado"
            allowClear
            style={{ width: 190 }}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            options={DELIVERY_STATUSES.map((s) => ({ label: s, value: s }))}
          />

          {(selectedStatus || selectedTimeRange || selectedCustomer) && (
            <Button onClick={handleResetFilters}>
              Limpiar Filtros
            </Button>
          )}
        </Space>

        {/* Tabla de Entregas */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={deliveries}
          loading={loading}
          pagination={{
            current: paginationInfo?.currentPage || currentPage,
            pageSize: paginationInfo?.limit || pageSize,
            total: paginationInfo?.totalItems || 0,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total: ${total} entregas`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal de Alta / Modificación */}
      <Modal
        title={editingDelivery ? 'Modificar Entrega' : 'Registrar Nueva Entrega'}
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          form.resetFields();
          setEditingDelivery(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form<CreateDeliveryDTO>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleFormSubmit(values)}
        >
          {!editingDelivery && (
            <Form.Item
              name="customer"
              label="Cliente Destinatario"
              rules={[{ required: true, message: 'Selecciona un cliente' }]}
            >
              <Select
                showSearch
                placeholder="Buscar cliente por apellido o nombre..."
                optionFilterProp="label"
                onChange={handleCustomerChange}
                options={customersList.map((c) => ({
                  label: `${c.lastName}, ${c.name} (DNI: ${c.idCard})`,
                  value: c._id,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="address"
            label="Dirección de Destino"
            rules={[
              { required: true, message: 'La dirección es obligatoria' },
              { min: 5, message: 'Mínimo 5 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Av. San Martín 1234, Piso 2 A" />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Franja Horaria"
            rules={[{ required: true, message: 'Selecciona una franja horaria' }]}
          >
            <Select
              options={TIME_RANGES.map((t) => ({
                label: t,
                value: t,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="distance"
            label="Distancia Estimada (km)"
            rules={[
              { required: true, message: 'La distancia es obligatoria' },
              { type: 'number', min: 0.1, message: 'Debe ser mayor a 0' },
            ]}
          >
            <InputNumber min={0.1} max={5000} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Estado Inicial"
            rules={[{ required: true, message: 'Selecciona un estado' }]}
          >
            <Select
              options={DELIVERY_STATUSES.map((s) => ({
                label: s,
                value: s,
              }))}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setIsFormModalOpen(false);
                  form.resetFields();
                  setEditingDelivery(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingDelivery ? 'Guardar Cambios' : 'Registrar Entrega'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Detalle */}
      <Modal
        title="Detalle de la Entrega"
        open={Boolean(viewingDelivery)}
        onCancel={() => setViewingDelivery(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewingDelivery(null)}>
            Cerrar
          </Button>,
        ]}
        width={650}
      >
        {viewingDelivery && (
          <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Cliente Destinatario">
                <strong>{getCustomerName(viewingDelivery.customer)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Dirección de Entrega">
                {viewingDelivery.address}
              </Descriptions.Item>
              <Descriptions.Item label="Franja Horaria">
                <Tag color="purple">{viewingDelivery.timeRange}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Distancia">
                {viewingDelivery.distance} km
              </Descriptions.Item>
              <Descriptions.Item label="Estado Actual">
                {getStatusTag(viewingDelivery.status)}
              </Descriptions.Item>
              {viewingDelivery.createdAt && (
                <Descriptions.Item label="Fecha de Creación">
                  {new Date(viewingDelivery.createdAt).toLocaleString()}
                </Descriptions.Item>
              )}
              {viewingDelivery.updatedAt && (
                <Descriptions.Item label="Última Actualización">
                  {new Date(viewingDelivery.updatedAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            {viewingDelivery.annotations && viewingDelivery.annotations.length > 0 && (
              <Card size="small" title="Historial de Anotaciones / Observaciones">
                <List
                  size="small"
                  dataSource={viewingDelivery.annotations}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            {item.status && getStatusTag(item.status)}
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                            </span>
                          </Space>
                        }
                        description={item.detail}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};
