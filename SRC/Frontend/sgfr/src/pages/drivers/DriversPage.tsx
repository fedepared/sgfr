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
  Switch,
  Divider,
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
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PageHeader } from '../../components/common';
import { driverService } from '../../services';
import { useAuth, useFetch } from '../../hooks';
import { ROLES } from '../../constants/roles.constant';
import { env } from '../../configs/env.config';
import type {
  Driver,
  DriverUser,
  LicenseType,
  CreateDriverDTO,
  UpdateDriverDTO,
  PaginatedResponse,
} from '../../interfaces';

export const DriversPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Estados de Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createAccountSwitch, setCreateAccountSwitch] = useState<boolean>(false);

  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateDriverDTO>();

  const isCoordinator = user?.role === ROLES.COORDINATOR;

  // Consulta de tipos de licencia disponibles con useFetch
  const { data: licenseTypesResponse } = useFetch<{ status: string; data: LicenseType[] }>(
    `${env.API_BASE_URL}/drivers/license-types`
  );
  const licenseTypes = useMemo(() => licenseTypesResponse?.data || [], [licenseTypesResponse]);

  // URL dinámica para listado de choferes
  const driversUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));

    if (appliedSearch.trim()) {
      params.set('search', appliedSearch.trim());
    }
    if (selectedLicenseType) {
      params.set('licenseType', selectedLicenseType);
    }

    return `${env.API_BASE_URL}/drivers?${params.toString()}`;
  }, [currentPage, pageSize, appliedSearch, selectedLicenseType]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Driver>>(driversUrl);

  const drivers = data?.data || [];
  const paginationInfo = data?.pagination;

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Error al conectar con la base de datos de choferes.');
    }
  }, [error, message]);

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setSelectedLicenseType(undefined);
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
    setEditingDriver(null);
    setCreateAccountSwitch(false);
    form.resetFields();
    if (licenseTypes.length > 0) {
      form.setFieldsValue({
        licenseType: licenseTypes[0]._id,
      });
    }
    setIsFormModalOpen(true);
  };

  // Abrir modal de Edición
  const handleOpenEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setCreateAccountSwitch(false);
    const licenseId = typeof driver.licenseType === 'string' ? driver.licenseType : driver.licenseType._id;
    form.setFieldsValue({
      name: driver.name,
      lastName: driver.lastName,
      idCard: driver.idCard,
      licenseType: licenseId,
    });
    setIsFormModalOpen(true);
  };

  // Guardar (Crear o Actualizar)
  const handleFormSubmit = async (values: CreateDriverDTO) => {
    setSubmitting(true);
    try {
      if (editingDriver) {
        const updatePayload: UpdateDriverDTO = {
          name: values.name.trim(),
          lastName: values.lastName.trim(),
          idCard: Number(values.idCard),
          licenseType: values.licenseType,
        };
        await driverService.update(editingDriver._id, updatePayload);
        message.success(`Chofer ${values.name} ${values.lastName} actualizado exitosamente.`);
      } else {
        const createPayload: CreateDriverDTO = {
          name: values.name.trim(),
          lastName: values.lastName.trim(),
          idCard: Number(values.idCard),
          licenseType: values.licenseType,
          ...(createAccountSwitch && values.createAccount
            ? {
                createAccount: {
                  userName: values.createAccount.userName.trim(),
                  password: values.createAccount.password.trim(),
                },
              }
            : {}),
        };
        await driverService.create(createPayload);
        message.success(`Chofer ${values.name} ${values.lastName} registrado exitosamente.`);
      }

      setIsFormModalOpen(false);
      form.resetFields();
      setEditingDriver(null);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al procesar la operación con el chofer.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar Chofer
  const handleDeleteDriver = async (id: string, fullName: string) => {
    try {
      await driverService.delete(id);
      message.success(`Chofer ${fullName} eliminado con éxito.`);
      void refetch();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al eliminar el chofer.';
      message.error(errorMsg);
    }
  };

  const getLicenseLabel = (license: LicenseType | string): string => {
    if (typeof license === 'string') return license;
    return `${license.licenseTypeLetter}${license.licenseTypeNumber} - ${license.description}`;
  };

  const columns: ColumnsType<Driver> = [
    {
      title: 'Chofer',
      key: 'fullName',
      render: (_: unknown, record: Driver) => (
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
      title: 'DNI / Documento',
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
      title: 'Tipo de Licencia',
      dataIndex: 'licenseType',
      key: 'licenseType',
      render: (license: LicenseType | string) => {
        if (typeof license === 'object' && license !== null) {
          return (
            <Tooltip title={license.description}>
              <Tag color="cyan">
                {license.licenseTypeLetter}
                {license.licenseTypeNumber}
              </Tag>
              <span style={{ fontSize: 13, color: '#595959' }}>{license.description}</span>
            </Tooltip>
          );
        }
        return <Tag>{license}</Tag>;
      },
    },
    {
      title: 'Usuario del Sistema',
      dataIndex: 'user',
      key: 'user',
      render: (userRecord: DriverUser | string | null | undefined) => {
        if (typeof userRecord === 'object' && userRecord !== null && userRecord.userName) {
          return (
            <Tag color="green" icon={<SafetyCertificateOutlined />}>
              {userRecord.userName}
            </Tag>
          );
        }
        return <Tag color="default">Sin Cuenta</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: unknown, record: Driver) => {
        const fullName = `${record.name} ${record.lastName}`;
        return (
          <Space orientation="horizontal" size="small">
            <Tooltip title="Ver detalles">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => setViewingDriver(record)}
              />
            </Tooltip>

            {isCoordinator && (
              <>
                <Tooltip title="Editar chofer">
                  <Button
                    type="text"
                    icon={<EditOutlined style={{ color: '#1677ff' }} />}
                    onClick={() => handleOpenEditModal(record)}
                  />
                </Tooltip>

                <Tooltip title="Eliminar chofer">
                  <Popconfirm
                    title="¿Eliminar chofer?"
                    description={`¿Estás seguro de que deseas eliminar a ${fullName}?`}
                    onConfirm={() => void handleDeleteDriver(record._id, fullName)}
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
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestión de Choferes"
        subtitle="Administración del personal de reparto, licencias habilitantes y credenciales de acceso"
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
                Nuevo Chofer
              </Button>
            )}
          </Space>
        }
      />

      <Card>
        {/* Barra de Búsqueda y Filtros */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar por DNI, nombre o apellido..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            placeholder="Filtrar por Licencia"
            allowClear
            style={{ width: 220 }}
            value={selectedLicenseType}
            onChange={(val) => {
              setSelectedLicenseType(val);
              setCurrentPage(1);
            }}
            options={licenseTypes.map((l) => ({
              label: `${l.licenseTypeLetter}${l.licenseTypeNumber} - ${l.description}`,
              value: l._id,
            }))}
          />

          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Buscar
          </Button>

          {(appliedSearch || selectedLicenseType) && (
            <Button onClick={handleResetFilters}>
              Limpiar Filtros
            </Button>
          )}
        </Space>

        {/* Tabla Principal */}
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={drivers}
          loading={loading}
          pagination={{
            current: paginationInfo?.currentPage || currentPage,
            pageSize: paginationInfo?.limit || pageSize,
            total: paginationInfo?.totalItems || 0,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Total: ${total} choferes`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal de Alta / Modificación */}
      <Modal
        title={
          editingDriver
            ? `Modificar Chofer: ${editingDriver.name} ${editingDriver.lastName}`
            : 'Registrar Nuevo Chofer'
        }
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          form.resetFields();
          setEditingDriver(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form<CreateDriverDTO>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleFormSubmit(values)}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[
              { required: true, message: 'El nombre es obligatorio' },
              { min: 2, message: 'Mínimo 2 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Carlos" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Apellido"
            rules={[
              { required: true, message: 'El apellido es obligatorio' },
              { min: 2, message: 'Mínimo 2 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Gómez" />
          </Form.Item>

          <Form.Item
            name="idCard"
            label="DNI / Número de Documento"
            rules={[
              { required: true, message: 'El DNI es obligatorio' },
              { type: 'number', min: 1000000, message: 'DNI válido requerido' },
            ]}
          >
            <InputNumber placeholder="Ej: 38456123" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="licenseType"
            label="Tipo de Licencia"
            rules={[{ required: true, message: 'El tipo de licencia es obligatorio' }]}
          >
            <Select
              placeholder="Seleccionar tipo de licencia"
              options={licenseTypes.map((l) => ({
                label: `${l.licenseTypeLetter}${l.licenseTypeNumber} - ${l.description}`,
                value: l._id,
              }))}
            />
          </Form.Item>

          {/* Opcional: Crear cuenta de usuario asociada (solo en el alta) */}
          {!editingDriver && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <strong>Crear usuario de acceso al sistema</strong>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    Permite al chofer iniciar sesión con su propia cuenta
                  </div>
                </div>
                <Switch checked={createAccountSwitch} onChange={setCreateAccountSwitch} />
              </div>

              {createAccountSwitch && (
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <Form.Item
                    name={['createAccount', 'userName']}
                    label="Nombre de Usuario"
                    rules={[{ required: createAccountSwitch, message: 'Ingresa un usuario' }]}
                  >
                    <Input placeholder="Ej: cgomez" prefix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name={['createAccount', 'password']}
                    label="Contraseña"
                    rules={[
                      { required: createAccountSwitch, message: 'Ingresa una contraseña' },
                      { min: 6, message: 'Mínimo 6 caracteres' },
                    ]}
                  >
                    <Input.Password placeholder="Mínimo 6 caracteres" />
                  </Form.Item>
                </div>
              )}
            </>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setIsFormModalOpen(false);
                  form.resetFields();
                  setEditingDriver(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingDriver ? 'Guardar Cambios' : 'Registrar Chofer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Detalle */}
      <Modal
        title={`Detalle de Chofer - ${viewingDriver ? `${viewingDriver.name} ${viewingDriver.lastName}` : ''}`}
        open={Boolean(viewingDriver)}
        onCancel={() => setViewingDriver(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewingDriver(null)}>
            Cerrar
          </Button>,
        ]}
      >
        {viewingDriver && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Identificador Mongo">
              <code>{viewingDriver._id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Nombre Completo">
              <strong>
                {viewingDriver.lastName}, {viewingDriver.name}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="DNI">
              {viewingDriver.idCard?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Licencia">
              <Tag color="cyan">{getLicenseLabel(viewingDriver.licenseType)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cuenta de Usuario">
              {typeof viewingDriver.user === 'object' && viewingDriver.user?.userName ? (
                <Tag color="green" icon={<SafetyCertificateOutlined />}>
                  {viewingDriver.user.userName}
                </Tag>
              ) : (
                <Tag color="default">Sin Usuario Vinculado</Tag>
              )}
            </Descriptions.Item>
            {viewingDriver.createdAt && (
              <Descriptions.Item label="Fecha de Alta">
                {new Date(viewingDriver.createdAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {viewingDriver.updatedAt && (
              <Descriptions.Item label="Última Modificación">
                {new Date(viewingDriver.updatedAt).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};
