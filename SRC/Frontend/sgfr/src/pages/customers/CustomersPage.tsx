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
  Popconfirm,
  Tooltip,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  IdcardOutlined,
  HomeOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PageHeader } from '../../components/common';
import { customerService } from '../../services';
import { useFetch } from '../../hooks';
import { env } from '../../configs/env.config';
import type {
  Customer,
  CustomerAddress,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PaginatedResponse,
} from '../../interfaces';

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { message } = App.useApp();
  const [form] = Form.useForm<CreateCustomerDTO>();

  // URL dinámica con búsqueda y paginación
  const customersUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));

    if (appliedSearch.trim()) {
      params.set('search', appliedSearch.trim());
    }

    return `${env.API_BASE_URL}/customers?${params.toString()}`;
  }, [currentPage, pageSize, appliedSearch]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Customer>>(customersUrl);

  const customers = data?.data || [];
  const paginationInfo = data?.pagination;

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Error al conectar con la base de datos de clientes.');
    }
  }, [error, message]);

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
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
    setEditingCustomer(null);
    form.resetFields();
    form.setFieldsValue({
      addresses: [{ street: '', zipCode: '' }],
    });
    setIsFormModalOpen(true);
  };

  // Abrir modal de Modificación
  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      lastName: customer.lastName,
      idCard: customer.idCard,
      addresses:
        customer.addresses && customer.addresses.length > 0
          ? customer.addresses
          : [{ street: '', zipCode: '' }],
    });
    setIsFormModalOpen(true);
  };

  // Guardar Cliente
  const handleFormSubmit = async (values: CreateCustomerDTO) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        lastName: values.lastName.trim(),
        idCard: Number(values.idCard),
        addresses: (values.addresses || []).map((addr) => ({
          street: addr.street.trim(),
          zipCode: addr.zipCode?.trim(),
          floor: addr.floor ? Number(addr.floor) : undefined,
          dept: addr.dept?.trim(),
        })),
      };

      if (editingCustomer) {
        await customerService.update(editingCustomer._id, payload as UpdateCustomerDTO);
        message.success(`Cliente ${payload.name} ${payload.lastName} actualizado exitosamente.`);
      } else {
        await customerService.create(payload);
        message.success(`Cliente ${payload.name} ${payload.lastName} registrado exitosamente.`);
      }

      setIsFormModalOpen(false);
      form.resetFields();
      setEditingCustomer(null);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al procesar el cliente.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar Cliente
  const handleDeleteCustomer = async (id: string, fullName: string) => {
    try {
      await customerService.delete(id);
      message.success(`Cliente ${fullName} eliminado con éxito.`);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al eliminar el cliente.';
      message.error(errorMsg);
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Cliente',
      key: 'fullName',
      render: (_: unknown, record: Customer) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <strong>
            {record.lastName}, {record.name}
          </strong>
        </Space>
      ),
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'DNI / CUIT',
      dataIndex: 'idCard',
      key: 'idCard',
      render: (idCard: number) => (
        <Space orientation="horizontal" size="small">
          <IdcardOutlined style={{ color: '#595959' }} />
          <span>{idCard?.toLocaleString()}</span>
        </Space>
      ),
    },
    {
      title: 'Dirección Principal',
      key: 'mainAddress',
      render: (_: unknown, record: Customer) => {
        if (!record.addresses || record.addresses.length === 0) {
          return <Tag color="default">Sin dirección</Tag>;
        }
        const first = record.addresses[0];
        const text = `${first.street}${first.floor ? `, Piso ${first.floor}` : ''}${
          first.dept ? ` Depto ${first.dept}` : ''
        }`;
        return (
          <Tooltip title={record.addresses.map((a) => a.street).join(' | ')}>
            <Space orientation="horizontal" size="small">
              <HomeOutlined style={{ color: '#1677ff' }} />
              <span>{text}</span>
              {record.addresses.length > 1 && (
                <Tag color="blue">+{record.addresses.length - 1}</Tag>
              )}
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: Customer) => {
        const fullName = `${record.name} ${record.lastName}`;
        return (
          <Space orientation="horizontal" size="small">
            <Tooltip title="Ver detalles">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => setViewingCustomer(record)}
              />
            </Tooltip>

            <Tooltip title="Editar cliente">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: '#1677ff' }} />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            <Tooltip title="Eliminar cliente">
              <Popconfirm
                title="¿Eliminar cliente?"
                description={`¿Estás seguro de que deseas eliminar a ${fullName}?`}
                onConfirm={() => void handleDeleteCustomer(record._id, fullName)}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Clientes"
        subtitle="Administración del padrón de destinatarios, domicilios de entrega e identificadores"
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
              Nuevo Cliente
            </Button>
          </Space>
        }
      />

      <Card>
        {/* Barra de Búsqueda */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar por DNI/CUIT, nombre o apellido..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
            allowClear
          />

          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Buscar
          </Button>

          {appliedSearch && (
            <Button onClick={handleResetFilters}>
              Limpiar Búsqueda
            </Button>
          )}
        </Space>

        {/* Tabla */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={customers}
          loading={loading}
          pagination={{
            current: paginationInfo?.currentPage || currentPage,
            pageSize: paginationInfo?.limit || pageSize,
            total: paginationInfo?.totalItems || 0,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total: ${total} clientes`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal Alta / Edición */}
      <Modal
        title={editingCustomer ? `Modificar Cliente: ${editingCustomer.name} ${editingCustomer.lastName}` : 'Registrar Nuevo Cliente'}
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          form.resetFields();
          setEditingCustomer(null);
        }}
        footer={null}
        destroyOnClose
        width={650}
      >
        <Form<CreateCustomerDTO>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleFormSubmit(values)}
        >
          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item
              name="name"
              label="Nombre"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { min: 2, message: 'Mínimo 2 caracteres' },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Ej: Juan" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Apellido"
              rules={[
                { required: true, message: 'El apellido es obligatorio' },
                { min: 2, message: 'Mínimo 2 caracteres' },
              ]}
              style={{ flex: 1 }}
            >
              <Input placeholder="Ej: Pérez" />
            </Form.Item>
          </Space>

          <Form.Item
            name="idCard"
            label="DNI o CUIT (sin guiones)"
            rules={[
              { required: true, message: 'El DNI o CUIT es obligatorio' },
              { type: 'number', min: 1000000, message: 'Documento numérico válido requerido' },
            ]}
          >
            <InputNumber placeholder="Ej: 30123456" style={{ width: '100%' }} />
          </Form.Item>

          {/* Domicilios Dinámicos */}
          <Card size="small" title="Domicilios de Entrega" style={{ marginBottom: 16 }}>
            <Form.List
              name="addresses"
              rules={[
                {
                  validator: async (_, addresses) => {
                    if (!addresses || addresses.length < 1) {
                      return Promise.reject(new Error('Debes ingresar al menos una dirección.'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline' }}
                      wrap
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'street']}
                        rules={[{ required: true, message: 'Ingresa la calle y altura' }]}
                      >
                        <Input placeholder="Calle y número (Ej: Belgrano 250)" style={{ width: 220 }} />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, 'floor']}>
                        <InputNumber placeholder="Piso" style={{ width: 70 }} />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, 'dept']}>
                        <Input placeholder="Dpto" style={{ width: 70 }} />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, 'zipCode']}>
                        <Input placeholder="C.P." style={{ width: 85 }} />
                      </Form.Item>

                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{ color: '#ff4d4f' }}
                          onClick={() => remove(name)}
                        />
                      )}
                    </Space>
                  ))}

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Agregar otra dirección
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setIsFormModalOpen(false);
                  form.resetFields();
                  setEditingCustomer(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        title={`Detalle de Cliente - ${viewingCustomer ? `${viewingCustomer.name} ${viewingCustomer.lastName}` : ''}`}
        open={Boolean(viewingCustomer)}
        onCancel={() => setViewingCustomer(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewingCustomer(null)}>
            Cerrar
          </Button>,
        ]}
      >
        {viewingCustomer && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Nombre Completo">
              <strong>
                {viewingCustomer.lastName}, {viewingCustomer.name}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="DNI / CUIT">
              {viewingCustomer.idCard?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Domicilios Registrados">
              {viewingCustomer.addresses && viewingCustomer.addresses.length > 0 ? (
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {viewingCustomer.addresses.map((addr: CustomerAddress, idx: number) => (
                    <li key={idx}>
                      {addr.street}
                      {addr.floor ? `, Piso ${addr.floor}` : ''}
                      {addr.dept ? ` Depto ${addr.dept}` : ''}
                      {addr.zipCode ? ` (CP: ${addr.zipCode})` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <Tag color="default">Sin domicilios</Tag>
              )}
            </Descriptions.Item>
            {viewingCustomer.createdAt && (
              <Descriptions.Item label="Fecha de Alta">
                {new Date(viewingCustomer.createdAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {viewingCustomer.updatedAt && (
              <Descriptions.Item label="Última Modificación">
                {new Date(viewingCustomer.updatedAt).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};
