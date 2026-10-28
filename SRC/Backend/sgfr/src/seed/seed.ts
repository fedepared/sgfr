import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { RoleModel } from '../data/role';
import { UserModel } from '../data/user';
import { VehicleTypeModel } from '../data/vehicleType';
import { VehicleStatusTypeModel } from '../data/vehicleStatusType';
import { VehicleModel } from '../data/vehicle';

const seedDatabase = async () => {
  try {
    console.log('cargando datos iniciales');
    await mongoose.connect(config.databaseUrl);
    console.log('Conectado a MongoDB:', config.databaseUrl);

    //Roles
    console.log('creando roles...');
    const roles = ['coordinador', 'chofer'];
    const rolesACargar: Record<string, any> = {};

    for (const roleName of roles) {
      let role = await RoleModel.findOne({ roleName });
      if (!role) {
        role = await RoleModel.create({ roleName });
        console.log(` Rol creado: ${roleName}`);
      } else {
        console.log(` Rol existente: ${roleName}`);
      }
      rolesACargar[roleName] = role;
    }

    // 2. Usuarios Iniciales
    console.log('\n creando usuarios...');
    const usersAAgregar = [
      {
        userName: 'coordinador_prueba',
        password: 'coordinador_prueba_123',
        roleName: 'coordinador',
      },
      {
        userName: 'chofer_prueba',
        password: 'chofer_prueba_123',
        roleName: 'chofer',
      },
    ];

    for (const u of usersAAgregar) {
      const usuarioExistente = await UserModel.findOne({ userName: u.userName });
      if (!usuarioExistente) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        await UserModel.create({
          userName: u.userName,
          passwordHash,
          roleType: rolesACargar[u.roleName]._id,
        });
        console.log(` Usuario creado: ${u.userName} (Rol: ${u.roleName})`);
      } else {
        console.log(` Usuario existente: ${u.userName}`);
      }
    }

    // 3. Tipos de Vehículo
    console.log('\n creando tipos de vehículo...');
    const vehicleTypes = ['Moto','Auto','Camión', 'Camioneta', 'Furgón', 'Utilitario'];
    const vehicleTypesAAgregar: Record<string, any> = {};

    for (const typeName of vehicleTypes) {
      let typeDoc = await VehicleTypeModel.findOne({ vehicleTypeName: typeName });
      if (!typeDoc) {
        typeDoc = await VehicleTypeModel.create({ vehicleTypeName: typeName });
        console.log(` Tipo creado: ${typeName}`);
      } else {
        console.log(` Tipo existente: ${typeName}`);
      }
      vehicleTypesAAgregar[typeName] = typeDoc;
    }

    // 4. Estados de Vehículo
    console.log('\n creando estados de vehículo...');
    const vehicleStatuses = ['Disponible', 'En ruta', 'En mantenimiento', 'Fuera de servicio'];
    const vehicleStatusAAgregar: Record<string, any> = {};

    for (const statusName of vehicleStatuses) {
      let statusDoc = await VehicleStatusTypeModel.findOne({ statusName });
      if (!statusDoc) {
        statusDoc = await VehicleStatusTypeModel.create({ statusName });
        console.log(` Estado creado: ${statusName}`);
      } else {
        console.log(` Estado existente: ${statusName}`);
      }
      vehicleStatusAAgregar[statusName] = statusDoc;
    }

    // 5. Vehículos Iniciales
    console.log('\n creando vehículos de prueba...');
    const vehiclesArray = [
      {
        licensePlate: 'AF123BC',
        vehicleType: vehicleTypesAAgregar['Camión']._id,
        capacity: 5000,
        status: vehicleStatusAAgregar['Disponible']._id,
      },
      {
        licensePlate: 'AE456DE',
        vehicleType: vehicleTypesAAgregar['Furgón']._id,
        capacity: 1500,
        status: vehicleStatusAAgregar['Disponible']._id,
      },
      {
        licensePlate: 'AD789FG',
        vehicleType: vehicleTypesAAgregar['Camioneta']._id,
        capacity: 1000,
        status: vehicleStatusAAgregar['En ruta']._id,
      },
      {
        licensePlate: 'AC321HJ',
        vehicleType: vehicleTypesAAgregar['Utilitario']._id,
        capacity: 800,
        status: vehicleStatusAAgregar['En mantenimiento']._id,
      },
    ];

    for (const v of vehiclesArray) {
      const vehiculoExistente = await VehicleModel.findOne({ licensePlate: v.licensePlate });
      if (!vehiculoExistente) {
        await VehicleModel.create(v);
        console.log(` Vehículo creado: ${v.licensePlate}`);
      } else {
        console.log(` Vehículo existente: ${v.licensePlate}`);
      }
    }

    console.log('\n--- carga completa exitosamente ---');
  } catch (error) {
    console.error('Error durante la ejecución de la carga:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada.');
    process.exit(0);
  }
};

seedDatabase();
