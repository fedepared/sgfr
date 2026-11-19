export interface LicenseType {
  _id: string;
  licenseTypeLetter: string;
  licenseTypeNumber: number;
  description: string;
}

export interface DriverUser {
  _id: string;
  userName: string;
  roleType?: string;
}

export interface Driver {
  _id: string;
  name: string;
  lastName: string;
  idCard: number;
  licenseType: LicenseType | string;
  user?: DriverUser | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDriverDTO {
  name: string;
  lastName: string;
  idCard: number;
  licenseType: string;
  user?: string;
  createAccount?: {
    userName: string;
    password: string;
  };
}

export interface UpdateDriverDTO {
  name?: string;
  lastName?: string;
  idCard?: number;
  licenseType?: string;
  user?: string | null;
}
