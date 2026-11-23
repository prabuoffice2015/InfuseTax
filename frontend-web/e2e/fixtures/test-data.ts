/**
 * Shared Test Data & Credentials for Local Playwright Automation
 */
export const TEST_USERS = {
  superadmin: {
    email: 'superadmin@infusetax.com',
    password: 'SuperAdmin@1234',
    name: 'InfuseTax Super Admin',
    role: 'super_admin',
    expectedPath: '/dashboard/company',
  },
  distributor: {
    email: 'sengu@infusetax.com',
    password: 'Admin@123',
    name: 'Sengu (Master Distributer)',
    role: 'distributor',
    expectedPath: '/dashboard/(admin|distributor)',
  },
  retailer: {
    email: 'retailer@infusetax.com',
    password: 'Admin@123',
    name: 'Retailer (Retailer Outlet Pos)',
    role: 'retailer',
    expectedPath: '/dashboard/retailer',
  },
  customer: {
    email: 'counter@infusetax.com',
    password: 'Admin@123',
    name: 'Ligadesshwaren p (Customer Client)',
    role: 'customer',
    expectedPath: '/dashboard/customer',
  },
  sailesh: {
    email: 'sailesh@infusetax.com',
    password: 'Admin@123',
    name: 'Sailesh (Counter Staff)',
    role: 'customer',
    expectedPath: '/dashboard/customer',
  },
  operator: {
    email: 'counter@infusetax.com',
    password: 'Admin@123',
    name: 'Ligadesshwaren p (Customer Client)',
    role: 'customer',
    expectedPath: '/dashboard/customer',
  },
};

export const SAMPLE_DATA = {
  pan: 'ABCDE1234F',
  gstin: '33AABCT9981K1Z2',
  aadhaar: '998877665544',
  tradeName: 'Playwright Automation Enterprise',
  legalName: 'Playwright Automation Pvt Ltd',
};
