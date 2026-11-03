import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { RoleModel } from '../data/role';
import { UserModel } from '../data/user';
import { VehicleModel } from '../data/vehicle';

const seedDatabase = async () => {
  try {
    console.log('cargando datos iniciales');
    await mongoose.connect(config.databaseUrl);
    console.log('Conectado a MongoDB:', config.databaseUrl);

    // Roles
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

    // Usuarios iniciales
    console.log('\ncreando usuarios...');
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

    // Vehículos iniciales
    console.log('\ncreando vehículos de prueba...');
    const vehiclesArray = [
      {
        licensePlate: 'AF123BC',
        vehicleType: 'Camion',
        capacity: 5000,
        status: 'Disponible',
      },
      {
        licensePlate: 'AE456DE',
        vehicleType: 'Furgon',
        capacity: 1500,
        status: 'Disponible',
      },
      {
        licensePlate: 'AD789FG',
        vehicleType: 'Auto',
        capacity: 1000,
        status: 'En ruta',
      },
      {
        licensePlate: 'AC321HJ',
        vehicleType: 'Utilitario',
        capacity: 800,
        status: 'En mantenimiento',
      },
    ] as const;

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
