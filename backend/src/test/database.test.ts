import { supabaseService } from '../services/supabaseService';
import { generateToken, verifyToken } from '../middleware/auth';

async function runDatabaseAndAuthTests() {
  console.log('=== RUNNING DATABASE & AUTHENTICATION TESTS ===\n');

  try {
    // 1. REGISTER NEW TEST VOTER
    const testEmail = `voter_${Date.now()}@example.com`;
    const testUsername = `voter_${Date.now()}`;
    const testPassword = 'SecurePassword123!';

    console.log('1. Testing User Registration...');
    const registeredUser = await supabaseService.createUser({
      name: 'Test Voter User',
      username: testUsername,
      email: testEmail,
      password: testPassword,
      phone: '+1-555-0199',
      dateOfBirth: '1995-05-15',
      countryState: 'California, USA',
      city: 'San Francisco',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      role: 'voter'
    });

    if (!registeredUser || !registeredUser.id) {
      throw new Error('FAILED: Registration did not return a valid user object.');
    }
    console.log('✓ User created successfully:', registeredUser.id, registeredUser.email);

    // Verify password is hashed
    if (!registeredUser.passwordHash || registeredUser.passwordHash === testPassword) {
      throw new Error('FAILED: Password was not hashed!');
    }
    console.log('✓ Password correctly hashed with bcrypt.');

    // 2. VERIFY PASSWORD
    console.log('\n2. Testing Password Verification...');
    const isValidPass = await supabaseService.verifyPassword(testPassword, registeredUser.passwordHash);
    if (!isValidPass) {
      throw new Error('FAILED: Password verification returned false for valid password.');
    }
    console.log('✓ Valid password verified successfully.');

    const isInvalidPass = await supabaseService.verifyPassword('WrongPassword', registeredUser.passwordHash);
    if (isInvalidPass) {
      throw new Error('FAILED: Password verification returned true for invalid password.');
    }
    console.log('✓ Invalid password correctly rejected.');

    // 3. TEST USER LOOKUP
    console.log('\n3. Testing User Lookup by Email & ID...');
    const fetchedByEmail = await supabaseService.getUserByEmail(testEmail);
    if (!fetchedByEmail || fetchedByEmail.id !== registeredUser.id) {
      throw new Error('FAILED: Could not retrieve created user by email.');
    }
    console.log('✓ User retrieved by email:', fetchedByEmail.email);

    const fetchedById = await supabaseService.getUserById(registeredUser.id);
    if (!fetchedById || fetchedById.id !== registeredUser.id) {
      throw new Error('FAILED: Could not retrieve created user by ID.');
    }
    console.log('✓ User retrieved by ID:', fetchedById.id);

    // 4. TEST PROFILE UPDATE
    console.log('\n4. Testing Profile Update Persistence...');
    const updatedName = 'Updated Voter Name';
    const updatedPhone = '+1-555-9999';
    const updatedUser = await supabaseService.updateUser(registeredUser.id, {
      name: updatedName,
      phone: updatedPhone
    });

    if (!updatedUser || updatedUser.name !== updatedName || updatedUser.phone !== updatedPhone) {
      throw new Error('FAILED: Profile update failed.');
    }

    const reFetchedUser = await supabaseService.getUserById(registeredUser.id);
    if (!reFetchedUser || reFetchedUser.name !== updatedName || reFetchedUser.phone !== updatedPhone) {
      throw new Error('FAILED: Updated profile did not persist in database.');
    }
    console.log('✓ Profile update persisted successfully:', reFetchedUser.name, reFetchedUser.phone);

    // 5. TEST JWT TOKEN GENERATION & VERIFICATION
    console.log('\n5. Testing JWT Token Generation & Verification...');
    const token = generateToken({
      id: registeredUser.id,
      email: registeredUser.email,
      name: registeredUser.name,
      role: registeredUser.role
    });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.id !== registeredUser.id) {
      throw new Error('FAILED: JWT token verification failed.');
    }
    console.log('✓ JWT token verified successfully for user:', decoded.id);

    // 6. TEST INVALID JWT TOKEN
    const invalidTokenDecoded = await verifyToken('invalid-jwt-token-string');
    if (invalidTokenDecoded !== null) {
      throw new Error('FAILED: Invalid JWT token was accepted.');
    }
    console.log('✓ Invalid JWT token correctly rejected.');

    console.log('\n=============================================');
    console.log('ALL DATABASE & AUTHENTICATION TESTS PASSED! 🎉');
    console.log('=============================================\n');
  } catch (err: any) {
    console.error('\nTEST SUITE FAILED ❌:', err.message);
    process.exit(1);
  }
}

runDatabaseAndAuthTests();
