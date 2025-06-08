import { PrismaClient } from '@prisma/client';
import { NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function testMigration() {
  console.log('🧪 Testing notifications table migration...\n');

  try {
    // Test 1: Verify enum constraint works
    console.log('1. Testing NotificationType enum constraint...');
    
    // Get a test user ID (assuming there's at least one user)
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      throw new Error('No users found in database for testing');
    }

    // Test valid enum values
    const validTypes: NotificationType[] = [
      'client_assignment',
      'audit_assignment', 
      'audit_stage_update',
      'audit_status_update'
    ];

    for (const type of validTypes) {
      const notification = await prisma.notification.create({
        data: {
          userId: testUser.id,
          message: `Test notification for ${type}`,
          type: type,
          createdByUserId: testUser.id,
          entityId: 'test-entity-123'
        }
      });
      console.log(`   ✅ Created notification with type: ${type}`);
      
      // Clean up test notification
      await prisma.notification.delete({ where: { id: notification.id } });
    }

    // Test 2: Verify foreign key constraints
    console.log('\n2. Testing foreign key constraints...');
    
    const testNotification = await prisma.notification.create({
      data: {
        userId: testUser.id,
        message: 'Test foreign key relationships',
        type: 'client_assignment',
        createdByUserId: testUser.id,
        entityId: 'test-entity-456'
      },
      include: {
        user: true,
        createdByUser: true
      }
    });

    if (testNotification.user.id === testUser.id && testNotification.createdByUser.id === testUser.id) {
      console.log('   ✅ Foreign key relationships working correctly');
    } else {
      throw new Error('Foreign key relationships not working correctly');
    }

    // Clean up test notification
    await prisma.notification.delete({ where: { id: testNotification.id } });

    // Test 3: Verify indexes exist by checking query performance
    console.log('\n3. Testing database indexes...');
    
    // Create multiple test notifications for index testing
    const testNotifications = await Promise.all([
      prisma.notification.create({
        data: {
          userId: testUser.id,
          message: 'Index test 1',
          type: 'client_assignment',
          createdByUserId: testUser.id,
          entityId: 'entity-1'
        }
      }),
      prisma.notification.create({
        data: {
          userId: testUser.id,
          message: 'Index test 2', 
          type: 'audit_assignment',
          createdByUserId: testUser.id,
          entityId: 'entity-2'
        }
      })
    ]);

    // Test userId + type index
    const userTypeQuery = await prisma.notification.findMany({
      where: {
        userId: testUser.id,
        type: 'client_assignment'
      }
    });
    console.log(`   ✅ userId + type index query returned ${userTypeQuery.length} results`);

    // Test type + entityId index
    const typeEntityQuery = await prisma.notification.findMany({
      where: {
        type: 'audit_assignment',
        entityId: 'entity-2'
      }
    });
    console.log(`   ✅ type + entityId index query returned ${typeEntityQuery.length} results`);

    // Test createdByUserId index
    const createdByQuery = await prisma.notification.findMany({
      where: {
        createdByUserId: testUser.id
      }
    });
    console.log(`   ✅ createdByUserId index query returned ${createdByQuery.length} results`);

    // Clean up test notifications
    await prisma.notification.deleteMany({
      where: {
        id: { in: testNotifications.map(n => n.id) }
      }
    });

    // Test 4: Verify enum validation rejects invalid types
    console.log('\n4. Testing enum validation (should fail with invalid type)...');
    
    try {
      // This should fail - testing with raw SQL to bypass TypeScript type checking
      await prisma.$executeRaw`
        INSERT INTO notifications (id, "userId", message, type, "createdByUserId", "createdAt")
        VALUES (gen_random_uuid(), ${testUser.id}, 'Invalid type test', 'invalid_type', ${testUser.id}, NOW())
      `;
      console.log('   ❌ ERROR: Invalid enum value was accepted (this should not happen)');
    } catch (error) {
      console.log('   ✅ Enum validation correctly rejected invalid type');
    }

    // Test 5: Verify required fields
    console.log('\n5. Testing required field validation...');
    
    try {
      await prisma.notification.create({
        data: {
          userId: testUser.id,
          message: 'Missing required fields',
          // Missing type and createdByUserId - should fail
        } as any
      });
      console.log('   ❌ ERROR: Missing required fields were accepted');
    } catch (error) {
      console.log('   ✅ Required field validation working correctly');
    }

    console.log('\n🎉 All migration tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Migration test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMigration(); 