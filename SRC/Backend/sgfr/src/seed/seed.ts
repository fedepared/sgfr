import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { RoleModel } from '../data/role';
import { UserModel } from '../data/user';
import { LicenseTypeModel } from '../data/licenseType';
import { DriverModel } from '../data/driver';
import { CustomerModel } from '../data/customer';
import { VehicleModel } from '../data/vehicle';
import { VehicleMaintenanceModel } from '../data/vehicleMaintenance';
import { RoadMapModel } from '../data/roadMap';

const seedDatabase = async () => {
  try {
    console.log('--- Migración de Datos Iniciales (SGFR) ---');
    await mongoose.connect(config.databaseUrl);
    console.log('Conectado a MongoDB en:', config.databaseUrl);

    // -------------------------------------------------------------
    // 1. ROLES DEL SISTEMA
    // -------------------------------------------------------------
    console.log('\n[1/7] Roles del sistema...');
    const roles = ['coordinador', 'chofer'];
    const rolesMap: Record<string, any> = {};

    for (const roleName of roles) {
      let roleDoc = await RoleModel.findOne({ roleName });
      if (!roleDoc) {
        roleDoc = await RoleModel.create({ roleName });
        console.log(`  + Rol creado: ${roleName}`);
      } else {
        console.log(`  = Rol existente: ${roleName}`);
      }
      rolesMap[roleName] = roleDoc;
    }

    // -------------------------------------------------------------
    // 2. USUARIOS INICIALES (Auth)
    // -------------------------------------------------------------
    console.log('\n[2/7] usuarios...');
    const usersToSeed = [
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
      {
        userName: 'chofer_carlos',
        password: 'chofer_carlos_123',
        roleName: 'chofer',
      },
    ];

    const usersMap: Record<string, any> = {};

    for (const u of usersToSeed) {
      let userDoc = await UserModel.findOne({ userName: u.userName });
      if (!userDoc) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        userDoc = await UserModel.create({
          userName: u.userName,
          passwordHash,
          roleType: rolesMap[u.roleName]._id,
        });
        console.log(`  + Usuario creado: ${u.userName} (Rol: ${u.roleName})`);
      } else {
        console.log(`  = Usuario existente: ${u.userName}`);
      }
      usersMap[u.userName] = userDoc;
    }

    // -------------------------------------------------------------
    // 3. TIPOS DE LICENCIA
    // -------------------------------------------------------------
    console.log('\n[3/7] Tipos de licencia...');
    const licensesToSeed = [
      {
        licenseTypeLetter: 'B',
        licenseTypeNumber: 1,
        description: 'Automóviles, camionetas y utilitarios hasta 3500 kg',
      },
      {
        licenseTypeLetter: 'C',
        licenseTypeNumber: 1,
        description: 'Camiones sin acoplado hasta 12000 kg',
      },
      {
        licenseTypeLetter: 'C',
        licenseTypeNumber: 2,
        description: 'Camiones de gran porte y transporte pesado',
      },
      {
        licenseTypeLetter: 'A',
        licenseTypeNumber: 2,
        description: 'Motocicletas hasta 150cc para mensajería rápida',
      },
    ];

    const licenseMap: Record<string, any> = {};

    for (const lic of licensesToSeed) {
      const key = `${lic.licenseTypeLetter}${lic.licenseTypeNumber}`;
      let licDoc = await LicenseTypeModel.findOne({
        licenseTypeLetter: lic.licenseTypeLetter,
        licenseTypeNumber: lic.licenseTypeNumber,
      });

      if (!licDoc) {
        licDoc = await LicenseTypeModel.create(lic);
        console.log(`  + Licencia creada: Clase ${key} - ${lic.description}`);
      } else {
        console.log(`  = Licencia existente: Clase ${key}`);
      }
      licenseMap[key] = licDoc;
    }

    // -------------------------------------------------------------
    // 4. CHOFERES
    // -------------------------------------------------------------
    console.log('\n[4/7] Choferes...');
    const driversToSeed = [
      {
        name: 'Roberto',
        lastName: 'Gómez',
        idCard: 32456789,
        licenseType: licenseMap['C1']._id,
        user: usersMap['chofer_prueba']._id,
      },
      {
        name: 'Carlos',
        lastName: 'Fernández',
        idCard: 28987654,
        licenseType: licenseMap['B1']._id,
        user: usersMap['chofer_carlos']._id,
      },
    ];

    const driversMap: Record<number, any> = {};

    for (const d of driversToSeed) {
      let driverDoc = await DriverModel.findOne({ idCard: d.idCard });
      if (!driverDoc) {
        driverDoc = await DriverModel.create(d);
        console.log(`  + Chofer creado: ${d.name} ${d.lastName} (DNI: ${d.idCard})`);
      } else {
        console.log(`  = Chofer existente: ${d.name} ${d.lastName} (DNI: ${d.idCard})`);
      }
      driversMap[d.idCard] = driverDoc;
    }

    // -------------------------------------------------------------
    // 5. CLIENTES (con direcciones estructuradas)
    // -------------------------------------------------------------
    console.log('\n[5/7] Clientes...');
    const customersToSeed = [
      {
        name: 'Distribuidora',
        lastName: 'Norte SRL',
        idCard: 30712345678,
        addresses: [
          { street: 'Av. Cabildo 2040', zipCode: '1428', floor: 2, dept: 'A' },
          { street: 'Juramento 1550', zipCode: '1428', floor: 0, dept: '' },
        ],
      },
      {
        name: 'Laura',
        lastName: 'Martínez',
        idCard: 35123987,
        addresses: [
          { street: 'Av. Corrientes 3450', zipCode: '1194', floor: 7, dept: 'B' },
        ],
      },
      {
        name: 'Comercial',
        lastName: 'San Martín',
        idCard: 30897654321,
        addresses: [
          { street: 'Rivadavia 4890', zipCode: '1424', floor: 1, dept: 'Local 3' },
        ],
      },
    ];

    const customersMap: Record<number, any> = {};

    for (const c of customersToSeed) {
      let customerDoc = await CustomerModel.findOne({ idCard: c.idCard });
      if (!customerDoc) {
        customerDoc = await CustomerModel.create(c);
        console.log(`  + Cliente creado: ${c.name} ${c.lastName} (ID: ${c.idCard})`);
      } else {
        console.log(`  = Cliente existente: ${c.name} ${c.lastName} (ID: ${c.idCard})`);
      }
      customersMap[c.idCard] = customerDoc;
    }

    // -------------------------------------------------------------
    // 6. VEHÍCULOS Y MANTENIMIENTOS (usando nuevos Enums)
    // -------------------------------------------------------------
    console.log('\n[6/7] Flota de vehículos y mantenimientos...');
    const vehiclesToSeed = [
      {
        licensePlate: 'AF123BC',
        vehicleType: 'Camion' as const,
        capacity: 5000,
        status: 'Disponible' as const,
      },
      {
        licensePlate: 'AE456DE',
        vehicleType: 'Furgon' as const,
        capacity: 1500,
        status: 'En ruta' as const,
      },
      {
        licensePlate: 'AD789FG',
        vehicleType: 'Auto' as const,
        capacity: 1000,
        status: 'Disponible' as const,
      },
      {
        licensePlate: 'AC321HJ',
        vehicleType: 'Utilitario' as const,
        capacity: 800,
        status: 'En mantenimiento' as const,
      },
    ];

    const vehiclesMap: Record<string, any> = {};

    for (const v of vehiclesToSeed) {
      let vehicleDoc = await VehicleModel.findOne({ licensePlate: v.licensePlate });
      if (!vehicleDoc) {
        vehicleDoc = await VehicleModel.create(v);
        console.log(`  + Vehículo creado: ${v.licensePlate} (${v.vehicleType} - Estado: ${v.status})`);
      } else {
        console.log(`  = Vehículo existente: ${v.licensePlate}`);
      }
      vehiclesMap[v.licensePlate] = vehicleDoc;
    }

    // Mantenimiento de prueba para el vehículo en mantenimiento
    const utilitarioDoc = vehiclesMap['AC321HJ'];
    if (utilitarioDoc) {
      const existingMaint = await VehicleMaintenanceModel.findOne({ vehicle: utilitarioDoc._id });
      if (!existingMaint) {
        await VehicleMaintenanceModel.create({
          vehicle: utilitarioDoc._id,
          vehicleMaintenanceType: 'Aceite y filtro',
          price: 45000,
          date: new Date(),
          description: 'Cambio preventivo de aceite sintético y filtros de aire y habitáculo',
        });
        console.log(`  + Mantenimiento creado para vehículo ${utilitarioDoc.licensePlate}`);
      } else {
        console.log(`  = Mantenimiento existente para vehículo ${utilitarioDoc.licensePlate}`);
      }
    }

    // -------------------------------------------------------------
    // 7. HOJA DE RUTA Y ENTREGAS EMBEBIDAS (Para el chofer de prueba)
    // -------------------------------------------------------------
    console.log('\n[7/7] Hoja de ruta del día con entregas embebidas...');
    const choferDoc = driversMap[32456789];
    const vehiculoEnRutaDoc = vehiclesMap['AE456DE'];
    const cliente1 = customersMap[30712345678];
    const cliente2 = customersMap[35123987];

    if (choferDoc && vehiculoEnRutaDoc && cliente1 && cliente2) {
      // Tomamos la fecha de hoy a las 00:00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingRoadMap = await RoadMapModel.findOne({
        driver: choferDoc._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (!existingRoadMap) {
        await RoadMapModel.create({
          date: new Date(),
          vehicle: vehiculoEnRutaDoc._id,
          driver: choferDoc._id,
          deliveries: [
            {
              customer: cliente1._id,
              address: `${cliente1.addresses[0].street}, Piso ${cliente1.addresses[0].floor} ${cliente1.addresses[0].dept}`,
              timeRange: '8:00 a 13:00',
              status: 'En camino',
              distance: 12.5,
              annotations: [
                {
                  detail: 'El cliente solicitó timbre fuerte o llamar por teléfono al llegar.',
                  status: 'En camino',
                },
              ],
            },
            {
              customer: cliente2._id,
              address: `${cliente2.addresses[0].street}, Piso ${cliente2.addresses[0].floor} ${cliente2.addresses[0].dept}`,
              timeRange: '13:00 a 18:00',
              status: 'Creado',
              distance: 8.2,
              annotations: [],
            },
          ],
        });
        console.log(`  + Hoja de ruta creada para chofer ${choferDoc.name} con 2 entregas asignadas.`);
      } else {
        console.log(`  = Hoja de ruta del día ya existente para chofer ${choferDoc.name}.`);
      }
    }

    console.log('\n=============================================');
    console.log('   Migración completa');
    console.log('=============================================');
  } catch (error) {
    console.error('Error durante la ejecución de la migracion:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada.');
    process.exit(0);
  }
};

seedDatabase();
