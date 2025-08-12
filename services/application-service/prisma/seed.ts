import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting auth service seed...');

  // Create default permissions
  const permissions = [
    // User management
    { name: 'user:create', description: 'Create users', resource: 'user', action: 'create' },
    { name: 'user:read', description: 'Read users', resource: 'user', action: 'read' },
    { name: 'user:update', description: 'Update users', resource: 'user', action: 'update' },
    { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
    
    // Ticket management
    { name: 'ticket:create', description: 'Create tickets', resource: 'ticket', action: 'create' },
    { name: 'ticket:read', description: 'Read tickets', resource: 'ticket', action: 'read' },
    { name: 'ticket:update', description: 'Update tickets', resource: 'ticket', action: 'update' },
    { name: 'ticket:delete', description: 'Delete tickets', resource: 'ticket', action: 'delete' },
    { name: 'ticket:assign', description: 'Assign tickets', resource: 'ticket', action: 'assign' },
    
    // Project management
    { name: 'project:create', description: 'Create projects', resource: 'project', action: 'create' },
    { name: 'project:read', description: 'Read projects', resource: 'project', action: 'read' },
    { name: 'project:update', description: 'Update projects', resource: 'project', action: 'update' },
    { name: 'project:delete', description: 'Delete projects', resource: 'project', action: 'delete' },
    
    // Reporting
    { name: 'report:generate', description: 'Generate reports', resource: 'report', action: 'generate' },
    { name: 'report:view', description: 'View reports', resource: 'report', action: 'view' },
    
    // Administration
    { name: 'admin:manage', description: 'Administrative management', resource: 'admin', action: 'manage' },
  ];

  console.log('Creating permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create role permissions
  const rolePermissions = [
    // ADMIN - Full access
    { role: Role.ADMIN, permissions: permissions.map(p => p.name) },
    
    // SUPPORT_L3 - Senior support with most permissions
    { 
      role: Role.SUPPORT_L3, 
      permissions: [
        'user:read', 'user:update',
        'ticket:create', 'ticket:read', 'ticket:update', 'ticket:assign',
        'project:read', 'project:update',
        'report:generate', 'report:view'
      ]
    },
    
    // SUPPORT_L2 - Mid-level support
    { 
      role: Role.SUPPORT_L2, 
      permissions: [
        'user:read',
        'ticket:create', 'ticket:read', 'ticket:update',
        'project:read',
        'report:view'
      ]
    },
    
    // SUPPORT_L1 - Basic support
    { 
      role: Role.SUPPORT_L1, 
      permissions: [
        'ticket:create', 'ticket:read', 'ticket:update',
        'project:read'
      ]
    },
    
    // DEVELOPER - Development focused
    { 
      role: Role.DEVELOPER, 
      permissions: [
        'ticket:create', 'ticket:read', 'ticket:update',
        'project:create', 'project:read', 'project:update'
      ]
    },
    
    // PROJECT_MANAGER - Project management focused
    { 
      role: Role.PROJECT_MANAGER, 
      permissions: [
        'user:read',
        'ticket:read',
        'project:create', 'project:read', 'project:update', 'project:delete',
        'report:generate', 'report:view'
      ]
    },
    
    // CLIENT - Limited access
    { 
      role: Role.CLIENT, 
      permissions: [
        'ticket:create', 'ticket:read'
      ]
    },
  ];

  console.log('Creating role permissions...');
  for (const rolePermission of rolePermissions) {
    for (const permissionName of rolePermission.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });
      
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_permissionId: {
              role: rolePermission.role,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            role: rolePermission.role,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  console.log('Creating default admin user...');
  
  await prisma.user.upsert({
    where: { email: 'admin@thedot.local' },
    update: {},
    create: {
      email: 'admin@thedot.local',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  // Create sample users for each role
  const sampleUsers = [
    {
      email: 'support.l1@thedot.local',
      username: 'support_l1',
      firstName: 'Level 1',
      lastName: 'Support',
      role: Role.SUPPORT_L1,
    },
    {
      email: 'support.l2@thedot.local',
      username: 'support_l2',
      firstName: 'Level 2',
      lastName: 'Support',
      role: Role.SUPPORT_L2,
    },
    {
      email: 'support.l3@thedot.local',
      username: 'support_l3',
      firstName: 'Level 3',
      lastName: 'Support',
      role: Role.SUPPORT_L3,
    },
    {
      email: 'developer@thedot.local',
      username: 'developer',
      firstName: 'John',
      lastName: 'Developer',
      role: Role.DEVELOPER,
    },
    {
      email: 'pm@thedot.local',
      username: 'project_manager',
      firstName: 'Jane',
      lastName: 'Manager',
      role: Role.PROJECT_MANAGER,
    },
    {
      email: 'client@thedot.local',
      username: 'client',
      firstName: 'External',
      lastName: 'Client',
      role: Role.CLIENT,
    },
  ];

  console.log('Creating sample users...');
  for (const userData of sampleUsers) {
    const password = await bcrypt.hash('password123', 10);
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password,
        isActive: true,
        isVerified: true,
      },
    });
  }

  console.log('✅ Auth service seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
