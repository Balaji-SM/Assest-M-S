const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Employee = require('../models/Employee');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const Maintenance = require('../models/Maintenance');
const ActivityLog = require('../models/ActivityLog');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Asset.deleteMany({});
    await AssetHistory.deleteMany({});
    await Maintenance.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('[Seed] Cleared existing collections.');

    // 1. Create Default Users (Admin & Staff)
    const adminUser = await User.create({
      name: 'BALAJI',
      email: 'admin@enterprise.com',
      password: 'Admin@123456',
      role: 'admin',
    });

    const standardUser = await User.create({
      name: 'Marcus Brody (Staff)',
      email: 'user@enterprise.com',
      password: 'User@123456',
      role: 'user',
    });
    console.log('[Seed] Created default users: admin@enterprise.com and user@enterprise.com');

    // 2. Create 10 Realistic Employees
    const employeeData = [
      {
        employeeId: 'EMP-1001',
        name: 'Sarah Connor',
        email: 'sarah.connor@enterprise.com',
        phone: '+1 (555) 234-5671',
        department: 'Engineering',
        designation: 'Lead Architect',
        joiningDate: new Date('2022-03-15'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1002',
        name: 'Alexander Hayes',
        email: 'a.hayes@enterprise.com',
        phone: '+1 (555) 345-6782',
        department: 'Engineering',
        designation: 'Senior Frontend Engineer',
        joiningDate: new Date('2022-07-01'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1003',
        name: 'Elena Rostova',
        email: 'elena.r@enterprise.com',
        phone: '+1 (555) 456-7893',
        department: 'Design',
        designation: 'Staff Product Designer',
        joiningDate: new Date('2021-11-10'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1004',
        name: 'David Kim',
        email: 'david.kim@enterprise.com',
        phone: '+1 (555) 567-8904',
        department: 'Operations',
        designation: 'DevOps & Cloud Lead',
        joiningDate: new Date('2023-01-20'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1005',
        name: 'Priya Patel',
        email: 'priya.patel@enterprise.com',
        phone: '+1 (555) 678-9015',
        department: 'Product',
        designation: 'Principal Product Manager',
        joiningDate: new Date('2022-05-18'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1006',
        name: 'James Wilson',
        email: 'j.wilson@enterprise.com',
        phone: '+1 (555) 789-0126',
        department: 'Marketing',
        designation: 'Brand Strategist',
        joiningDate: new Date('2023-04-12'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1007',
        name: 'Amina Al-Mansoor',
        email: 'amina.m@enterprise.com',
        phone: '+1 (555) 890-1237',
        department: 'Human Resources',
        designation: 'People Ops Director',
        joiningDate: new Date('2020-09-01'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1008',
        name: 'Carlos Mendez',
        email: 'carlos.m@enterprise.com',
        phone: '+1 (555) 901-2348',
        department: 'Finance',
        designation: 'Financial Analyst',
        joiningDate: new Date('2022-10-05'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1009',
        name: 'Rachel Green',
        email: 'rachel.g@enterprise.com',
        phone: '+1 (555) 012-3459',
        department: 'Sales',
        designation: 'Enterprise Account Executive',
        joiningDate: new Date('2023-08-15'),
        status: 'Active',
      },
      {
        employeeId: 'EMP-1010',
        name: 'Lucas Thorne',
        email: 'lucas.t@enterprise.com',
        phone: '+1 (555) 123-4560',
        department: 'Legal',
        designation: 'Compliance Officer',
        joiningDate: new Date('2021-06-25'),
        status: 'On Leave',
      },
    ];

    const employees = await Employee.insertMany(employeeData);
    console.log(`[Seed] Inserted ${employees.length} employees.`);

    // Helper dates
    const now = new Date();
    const daysFromNow = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };
    const monthsAgo = (months) => {
      const d = new Date();
      d.setMonth(d.getMonth() - months);
      return d;
    };

    // 3. Create 20 Enterprise Assets
    const assetData = [
      // 1. Assigned Laptop
      {
        assetId: 'AST-1001',
        name: 'MacBook Pro 16" M3 Max',
        category: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Pro 16 M3 Max / 64GB / 1TB',
        serialNumber: 'APL-MBP16-99201',
        purchaseDate: monthsAgo(14),
        purchaseCost: 3499,
        warrantyExpiry: daysFromNow(450),
        status: 'Assigned',
        location: 'HQ Floor 4 - Engineering Bay',
        description: 'Primary engineering workstation equipped with dev tooling.',
        assignedTo: employees[0]._id,
        assignedDate: monthsAgo(12),
        expectedReturnDate: daysFromNow(240),
        assignmentNotes: 'Assigned for core architectural development.',
      },
      // 2. Assigned Laptop
      {
        assetId: 'AST-1002',
        name: 'Dell XPS 15 9530',
        category: 'Laptop',
        brand: 'Dell',
        model: 'XPS 15 / i7-13700H / 32GB / RTX 4060',
        serialNumber: 'DEL-XPS15-88312',
        purchaseDate: monthsAgo(10),
        purchaseCost: 2199,
        warrantyExpiry: daysFromNow(12), // Expiring in 12 days! (Warranty Alert)
        status: 'Assigned',
        location: 'HQ Floor 4 - Engineering Bay',
        description: 'Senior frontend developer workstation.',
        assignedTo: employees[1]._id,
        assignedDate: monthsAgo(9),
        expectedReturnDate: daysFromNow(180),
        assignmentNotes: 'Frontend engineering workstation setup.',
      },
      // 3. Assigned Laptop
      {
        assetId: 'AST-1003',
        name: 'MacBook Air 15" M2',
        category: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Air 15 / 16GB / 512GB',
        serialNumber: 'APL-MBA15-77421',
        purchaseDate: monthsAgo(8),
        purchaseCost: 1499,
        warrantyExpiry: daysFromNow(280),
        status: 'Assigned',
        location: 'HQ Floor 3 - Product & Design',
        description: 'UI/UX Design workstation with Figma and Creative Suite.',
        assignedTo: employees[2]._id,
        assignedDate: monthsAgo(7),
        expectedReturnDate: daysFromNow(150),
        assignmentNotes: 'Assigned for design work.',
      },
      // 4. Assigned Laptop
      {
        assetId: 'AST-1004',
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        category: 'Laptop',
        brand: 'Lenovo',
        model: 'X1 Carbon Gen 11 / i7 / 32GB / 1TB',
        serialNumber: 'LNV-X1C11-66512',
        purchaseDate: monthsAgo(15),
        purchaseCost: 1899,
        warrantyExpiry: daysFromNow(8), // Expiring in 8 days! (Warranty Alert)
        status: 'Assigned',
        location: 'HQ Floor 4 - Operations',
        description: 'DevOps cloud management terminal.',
        assignedTo: employees[3]._id,
        assignedDate: monthsAgo(14),
        expectedReturnDate: daysFromNow(90),
        assignmentNotes: 'Operations primary laptop.',
      },
      // 5. Assigned Laptop
      {
        assetId: 'AST-1005',
        name: 'HP EliteBook 840 G10',
        category: 'Laptop',
        brand: 'HP',
        model: 'EliteBook 840 G10 / i7 / 16GB / 512GB',
        serialNumber: 'HPE-840G10-55102',
        purchaseDate: monthsAgo(6),
        purchaseCost: 1350,
        warrantyExpiry: daysFromNow(540),
        status: 'Assigned',
        location: 'HQ Floor 3 - Product',
        description: 'Product management portable laptop.',
        assignedTo: employees[4]._id,
        assignedDate: monthsAgo(5),
        expectedReturnDate: daysFromNow(200),
        assignmentNotes: 'Assigned to Principal PM.',
      },
      // 6. Available Laptop
      {
        assetId: 'AST-1006',
        name: 'Dell Latitude 7440',
        category: 'Laptop',
        brand: 'Dell',
        model: 'Latitude 7440 / i5 / 16GB / 256GB',
        serialNumber: 'DEL-LAT74-44219',
        purchaseDate: monthsAgo(3),
        purchaseCost: 1199,
        warrantyExpiry: daysFromNow(620),
        status: 'Available',
        location: 'IT Storage Room A',
        description: 'Spare business laptop ready for new onboarding.',
        assignedTo: null,
      },
      // 7. Available Laptop
      {
        assetId: 'AST-1007',
        name: 'Apple MacBook Pro 14" M3 Pro',
        category: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Pro 14 M3 Pro / 18GB / 512GB',
        serialNumber: 'APL-MBP14-33109',
        purchaseDate: monthsAgo(2),
        purchaseCost: 1999,
        warrantyExpiry: daysFromNow(700),
        status: 'Available',
        location: 'IT Secure Safe',
        description: 'Unassigned executive MacBook Pro.',
        assignedTo: null,
      },
      // 8. Assigned Desktop
      {
        assetId: 'AST-1008',
        name: 'Apple Mac Studio M2 Ultra',
        category: 'Desktop',
        brand: 'Apple',
        model: 'Mac Studio M2 Ultra / 64GB / 2TB',
        serialNumber: 'APL-MCS-22194',
        purchaseDate: monthsAgo(11),
        purchaseCost: 3999,
        warrantyExpiry: daysFromNow(390),
        status: 'Assigned',
        location: 'Design Studio Lab 1',
        description: 'Heavy rendering and video design station.',
        assignedTo: employees[2]._id,
        assignedDate: monthsAgo(10),
        expectedReturnDate: daysFromNow(300),
        assignmentNotes: 'Studio desktop for design team 3D assets.',
      },
      // 9. Available Desktop
      {
        assetId: 'AST-1009',
        name: 'HP Z2 Mini G9 Workstation',
        category: 'Desktop',
        brand: 'HP',
        model: 'Z2 Mini G9 / i9-13900K / 64GB / RTX A2000',
        serialNumber: 'HPE-Z2M-11029',
        purchaseDate: monthsAgo(5),
        purchaseCost: 2650,
        warrantyExpiry: daysFromNow(550),
        status: 'Available',
        location: 'IT Storage Room B',
        description: 'High-performance compact engineering desktop.',
        assignedTo: null,
      },
      // 10. Assigned Monitor
      {
        assetId: 'AST-1010',
        name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
        category: 'Monitor',
        brand: 'Dell',
        model: 'U3223QE 4K IPS Black',
        serialNumber: 'DEL-MON-99120',
        purchaseDate: monthsAgo(12),
        purchaseCost: 899,
        warrantyExpiry: daysFromNow(21), // Expiring in 21 days! (Warranty Alert)
        status: 'Assigned',
        location: 'Desk 402 - Sarah Connor',
        description: 'Primary 4K monitor.',
        assignedTo: employees[0]._id,
        assignedDate: monthsAgo(11),
        expectedReturnDate: daysFromNow(240),
        assignmentNotes: 'Monitor pair for engineering workstation.',
      },
      // 11. Assigned Monitor
      {
        assetId: 'AST-1011',
        name: 'Studio Display 27" 5K Retina',
        category: 'Monitor',
        brand: 'Apple',
        model: 'Studio Display Nano-texture Glass',
        serialNumber: 'APL-STD-88210',
        purchaseDate: monthsAgo(8),
        purchaseCost: 1899,
        warrantyExpiry: daysFromNow(280),
        status: 'Assigned',
        location: 'Desk 305 - Elena Rostova',
        description: 'Color-calibrated 5K designer display.',
        assignedTo: employees[2]._id,
        assignedDate: monthsAgo(7),
        expectedReturnDate: daysFromNow(200),
        assignmentNotes: 'High accuracy color grading monitor.',
      },
      // 12. Available Monitor
      {
        assetId: 'AST-1012',
        name: 'LG UltraFine 27" 4K Ergo',
        category: 'Monitor',
        brand: 'LG',
        model: '27UN880-B Ergo Stand',
        serialNumber: 'LGE-27U-77192',
        purchaseDate: monthsAgo(4),
        purchaseCost: 479,
        warrantyExpiry: daysFromNow(680),
        status: 'Available',
        location: 'IT Storage Room A',
        description: 'Spare 4K ergo monitor in original packaging.',
        assignedTo: null,
      },
      // 13. Assigned Mobile
      {
        assetId: 'AST-1013',
        name: 'Apple iPhone 15 Pro Max',
        category: 'Mobile',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max / 256GB / Natural Titanium',
        serialNumber: 'APL-IPH-66102',
        purchaseDate: monthsAgo(9),
        purchaseCost: 1199,
        warrantyExpiry: daysFromNow(270),
        status: 'Assigned',
        location: 'Remote - Enterprise Sales',
        description: 'Company phone for client calls and travel.',
        assignedTo: employees[8]._id,
        assignedDate: monthsAgo(8),
        expectedReturnDate: daysFromNow(180),
        assignmentNotes: 'Sales field phone.',
      },
      // 14. Available Mobile
      {
        assetId: 'AST-1014',
        name: 'Google Pixel 8 Pro',
        category: 'Mobile',
        brand: 'Google',
        model: 'Pixel 8 Pro / 128GB / Obsidian',
        serialNumber: 'GGL-PX8-55291',
        purchaseDate: monthsAgo(6),
        purchaseCost: 999,
        warrantyExpiry: daysFromNow(300),
        status: 'Available',
        location: 'IT Secure Safe',
        description: 'Mobile test device for Android QA builds.',
        assignedTo: null,
      },
      // 15. Assigned Tablet
      {
        assetId: 'AST-1015',
        name: 'Apple iPad Pro 12.9" M2',
        category: 'Tablet',
        brand: 'Apple',
        model: 'iPad Pro 12.9 6th Gen / Wi-Fi + Cellular 256GB',
        serialNumber: 'APL-IPD-44102',
        purchaseDate: monthsAgo(14),
        purchaseCost: 1299,
        warrantyExpiry: daysFromNow(18), // Expiring in 18 days! (Warranty Alert)
        status: 'Assigned',
        location: 'Desk 305 - Design Lab',
        description: 'Digital sketching tablet with Apple Pencil 2.',
        assignedTo: employees[2]._id,
        assignedDate: monthsAgo(12),
        expectedReturnDate: daysFromNow(180),
        assignmentNotes: 'Assigned for UX wireframing and client demos.',
      },
      // 16. In Maintenance Asset
      {
        assetId: 'AST-1016',
        name: 'Brother Color Laser Multifunction Printer',
        category: 'Printer',
        brand: 'Brother',
        model: 'MFC-L8905CDW Business Color Laser',
        serialNumber: 'BTH-PRN-33291',
        purchaseDate: monthsAgo(18),
        purchaseCost: 649,
        warrantyExpiry: monthsAgo(2), // Expired warranty
        status: 'Maintenance',
        location: 'HQ Floor 2 - Copy Room',
        description: 'High-volume office departmental printer.',
        assignedTo: null,
      },
      // 17. In Maintenance Asset
      {
        assetId: 'AST-1017',
        name: 'Dell Precision 7680 Mobile Workstation',
        category: 'Laptop',
        brand: 'Dell',
        model: 'Precision 7680 / i9 / 64GB / RTX 5000',
        serialNumber: 'DEL-PRC-22108',
        purchaseDate: monthsAgo(13),
        purchaseCost: 4150,
        warrantyExpiry: daysFromNow(580),
        status: 'Maintenance',
        location: 'Authorized Dell Repair Facility',
        description: 'Hardware GPU throttling diagnosis underway.',
        assignedTo: null,
      },
      // 18. Retired Asset
      {
        assetId: 'AST-1018',
        name: 'Cisco Catalyst 2960-X Switch',
        category: 'Networking',
        brand: 'Cisco',
        model: 'WS-C2960X-48TD-L 48 Port GigE',
        serialNumber: 'CSC-SWT-11920',
        purchaseDate: monthsAgo(48),
        purchaseCost: 1599,
        warrantyExpiry: monthsAgo(24),
        status: 'Retired',
        location: 'Recycling Depot Floor B2',
        description: 'Decommissioned during 10GbE network upgrade.',
        assignedTo: null,
      },
      // 19. Available Networking
      {
        assetId: 'AST-1019',
        name: 'UniFi Dream Machine Pro',
        category: 'Networking',
        brand: 'Ubiquiti',
        model: 'UDM-Pro All-In-One Enterprise Gateway',
        serialNumber: 'UBI-UDM-00291',
        purchaseDate: monthsAgo(4),
        purchaseCost: 379,
        warrantyExpiry: daysFromNow(690),
        status: 'Available',
        location: 'Server Room Rack 2',
        description: 'Spare enterprise security gateway router.',
        assignedTo: null,
      },
      // 20. Available Peripheral
      {
        assetId: 'AST-1020',
        name: 'Logitech MX Master 3S & MX Mechanical Bundle',
        category: 'Mouse',
        brand: 'Logitech',
        model: 'MX Master 3S + MX Mechanical Wireless Combo',
        serialNumber: 'LOG-KBM-99102',
        purchaseDate: monthsAgo(2),
        purchaseCost: 280,
        warrantyExpiry: daysFromNow(710),
        status: 'Available',
        location: 'IT Supply Cabinet 3',
        description: 'Ergonomic keyboard and mouse peripheral bundle.',
        assignedTo: null,
      },
    ];

    const assets = await Asset.insertMany(assetData);
    console.log(`[Seed] Inserted ${assets.length} assets.`);

    // 4. Create Realistic Asset Lifecycle History
    const historyRecords = [];

    // All assets get an initial creation history
    for (const asset of assets) {
      historyRecords.push({
        asset: asset._id,
        action: 'ASSET_CREATED',
        performedBy: adminUser._id,
        performedByName: adminUser.name,
        date: asset.purchaseDate,
        notes: `Asset procured and added to inventory. Status: 'Available'. Cost: $${asset.purchaseCost}`,
      });

      // If asset is currently assigned, add assignment history
      if (asset.status === 'Assigned' && asset.assignedTo) {
        const emp = employees.find((e) => e._id.toString() === asset.assignedTo.toString());
        historyRecords.push({
          asset: asset._id,
          action: 'ASSIGNED',
          employee: emp ? emp._id : null,
          employeeName: emp ? `${emp.name} (${emp.employeeId})` : 'Employee',
          performedBy: adminUser._id,
          performedByName: adminUser.name,
          date: asset.assignedDate || monthsAgo(6),
          notes: asset.assignmentNotes || `Assigned to ${emp?.name}`,
        });
      }

      // If asset is in Maintenance, add maintenance started history
      if (asset.status === 'Maintenance') {
        historyRecords.push({
          asset: asset._id,
          action: 'MAINTENANCE_STARTED',
          performedBy: adminUser._id,
          performedByName: adminUser.name,
          date: monthsAgo(1),
          notes: `Sent for repair due to diagnostic fault.`,
        });
      }

      // If asset is Retired
      if (asset.status === 'Retired') {
        historyRecords.push({
          asset: asset._id,
          action: 'ASSET_RETIRED',
          performedBy: adminUser._id,
          performedByName: adminUser.name,
          date: monthsAgo(6),
          notes: 'Hardware phased out and decommissioned.',
        });
      }
    }

    // Add some return histories for realism
    historyRecords.push({
      asset: assets[0]._id, // AST-1001 previously returned from another employee
      action: 'RETURNED',
      employee: employees[1]._id,
      employeeName: `${employees[1].name} (${employees[1].employeeId})`,
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      date: monthsAgo(13),
      condition: 'Good',
      notes: 'Returned before employee transferred departments.',
    });

    await AssetHistory.insertMany(historyRecords);
    console.log(`[Seed] Inserted ${historyRecords.length} asset history records.`);

    // 5. Create Maintenance Records
    const maintenanceRecords = [
      {
        asset: assets[15]._id, // Brother Printer AST-1016
        maintenanceDate: monthsAgo(1),
        reason: 'Paper jam sensor error and drum unit replacement',
        cost: 165,
        serviceProvider: 'Brother Certified Field Tech',
        notes: 'Replacing primary transfer roller and cleaning sensors.',
        status: 'In Progress',
        performedBy: adminUser._id,
        performedByName: adminUser.name,
      },
      {
        asset: assets[16]._id, // Dell Precision Laptop AST-1017
        maintenanceDate: new Date('2024-08-10'),
        reason: 'Thermal paste reapplication and fan bearing replacement',
        cost: 210,
        serviceProvider: 'Dell Premier Support',
        notes: 'Heatsink assembly overhaul.',
        status: 'In Progress',
        performedBy: adminUser._id,
        performedByName: adminUser.name,
      },
      {
        asset: assets[0]._id, // MacBook Pro AST-1001 (Completed repair in past)
        maintenanceDate: monthsAgo(11),
        completedDate: monthsAgo(10),
        reason: 'Battery service warning calibration',
        cost: 199,
        serviceProvider: 'Apple Store Genius Bar',
        notes: 'Diagnostic passed, battery replaced under AppleCare.',
        status: 'Completed',
        performedBy: adminUser._id,
        performedByName: adminUser.name,
      },
      {
        asset: assets[1]._id, // Dell XPS AST-1002 (Completed repair in past)
        maintenanceDate: monthsAgo(8),
        completedDate: monthsAgo(8),
        reason: 'Keyboard keycap sticking (Spacebar)',
        cost: 65,
        serviceProvider: 'Dell On-site Service',
        notes: 'Top chassis keyboard assembly swapped.',
        status: 'Completed',
        performedBy: adminUser._id,
        performedByName: adminUser.name,
      },
    ];

    await Maintenance.insertMany(maintenanceRecords);
    console.log(`[Seed] Inserted ${maintenanceRecords.length} maintenance records.`);

    // 6. Create Audit Activity Logs
    const activityLogs = [
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'ASSET_CREATED',
        asset: assets[0]._id,
        assetName: `${assets[0].name} (${assets[0].assetId})`,
        details: 'Initial procurement registered.',
        createdAt: monthsAgo(14),
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'ASSET_ASSIGNED',
        asset: assets[0]._id,
        assetName: `${assets[0].name} (${assets[0].assetId})`,
        details: `Assigned to ${employees[0].name} (${employees[0].department})`,
        createdAt: monthsAgo(12),
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'ASSET_ASSIGNED',
        asset: assets[1]._id,
        assetName: `${assets[1].name} (${assets[1].assetId})`,
        details: `Assigned to ${employees[1].name} (${employees[1].department})`,
        createdAt: monthsAgo(9),
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'MAINTENANCE_STARTED',
        asset: assets[15]._id,
        assetName: `${assets[15].name} (${assets[15].assetId})`,
        details: 'Sent Brother Printer to maintenance for sensor overhaul.',
        createdAt: monthsAgo(1),
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        action: 'USER_LOGIN',
        details: 'Admin logged into portal from Web Client',
        createdAt: new Date(),
      },
    ];

    await ActivityLog.insertMany(activityLogs);
    console.log(`[Seed] Inserted ${activityLogs.length} activity audit log records.`);

    console.log('\n======================================================');
    console.log(' DATABASE SEED COMPLETED SUCCESSFULLY!                ');
    console.log('======================================================');
    console.log(' Demo Accounts Created:');
    console.log('   Admin: admin@enterprise.com / Admin@123456');
    console.log('   Staff: user@enterprise.com  / User@123456');
    console.log(' Stats:');
    console.log(`   Employees:    ${employees.length}`);
    console.log(`   Assets:       ${assets.length}`);
    console.log(`   History logs: ${historyRecords.length}`);
    console.log(`   Maintenance:  ${maintenanceRecords.length}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
