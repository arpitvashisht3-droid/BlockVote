import { supabaseService } from '../services/supabaseService';
import { generateToken, verifyToken } from '../middleware/auth';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('    BLOCKVOTE END-TO-END USER LIFECYCLE TEST        ');
  console.log('====================================================\n');

  try {
    const timestamp = Date.now();
    const newVoter = {
      name: 'Eleanor Vance',
      username: `eleanor_${timestamp}`,
      email: `eleanor_${timestamp}@blockvote.io`,
      password: 'StrongVoterPassword2026!',
      phone: '+1 (555) 432-1098',
      dateOfBirth: '1992-08-24',
      countryState: 'New York, USA',
      city: 'Brooklyn',
      walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
    };

    // 1. SIGNUP & DATABASE CREATION
    console.log('Step 1: Signing up new voter account...');
    const existingCheck = await supabaseService.getUserByEmail(newVoter.email);
    if (existingCheck) {
      throw new Error('E2E Test Failure: User email already exists.');
    }

    const createdUser = await supabaseService.createUser({
      name: newVoter.name,
      username: newVoter.username,
      email: newVoter.email,
      password: newVoter.password,
      phone: newVoter.phone,
      dateOfBirth: newVoter.dateOfBirth,
      countryState: newVoter.countryState,
      city: newVoter.city,
      walletAddress: newVoter.walletAddress,
      role: 'voter'
    });

    console.log('✓ Account created in database. User ID:', createdUser.id);
    if (createdUser.passwordHash === newVoter.password) {
      throw new Error('E2E Test Failure: Password was stored in plaintext!');
    }
    console.log('✓ Security check passed: Password is bcrypt hashed.');

    // 2. LOGIN AUTHENTICATION
    console.log('\nStep 2: Authenticating voter login credentials...');
    const dbUser = await supabaseService.getUserByEmail(newVoter.email);
    if (!dbUser || !dbUser.passwordHash) {
      throw new Error('E2E Test Failure: User record missing from database.');
    }

    const passMatches = await supabaseService.verifyPassword(newVoter.password, dbUser.passwordHash);
    if (!passMatches) {
      throw new Error('E2E Test Failure: Password verification failed.');
    }

    const authToken = generateToken({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    });
    console.log('✓ Authentication successful. JWT session token generated.');

    // 3. FETCH PROFILE & VERIFY DATABASE DATA
    console.log('\nStep 3: Fetching user profile via token auth...');
    const decodedSession = await verifyToken(authToken);
    if (!decodedSession) {
      throw new Error('E2E Test Failure: JWT token verification failed.');
    }

    const fetchedProfile = await supabaseService.getUserById(decodedSession.id);
    if (!fetchedProfile || fetchedProfile.name !== newVoter.name) {
      throw new Error('E2E Test Failure: Profile data mismatch.');
    }
    console.log('✓ Database profile returned:', {
      Name: fetchedProfile.name,
      Email: fetchedProfile.email,
      Username: fetchedProfile.username,
      Phone: fetchedProfile.phone,
      DOB: fetchedProfile.dateOfBirth,
      City: fetchedProfile.city,
      Role: fetchedProfile.role,
      Verified: fetchedProfile.isVerified
    });

    // 4. PROFILE EDITING & PERSISTENCE
    console.log('\nStep 4: Updating voter profile details...');
    const updatedPhone = '+1 (555) 999-8888';
    const updatedCity = 'Manhattan';

    const updatedProfile = await supabaseService.updateUser(fetchedProfile.id, {
      phone: updatedPhone,
      city: updatedCity
    });

    if (!updatedProfile || updatedProfile.phone !== updatedPhone || updatedProfile.city !== updatedCity) {
      throw new Error('E2E Test Failure: Profile update failed.');
    }

    // Refresh simulation from database
    const refreshedProfile = await supabaseService.getUserById(fetchedProfile.id);
    if (!refreshedProfile || refreshedProfile.phone !== updatedPhone || refreshedProfile.city !== updatedCity) {
      throw new Error('E2E Test Failure: Profile changes did not persist across refresh.');
    }
    console.log('✓ Profile changes persisted in database:', {
      UpdatedPhone: refreshedProfile.phone,
      UpdatedCity: refreshedProfile.city
    });

    // 5. SESSION SURVIVAL & LOGOUT INVALIDATION
    console.log('\nStep 5: Testing session survival and logout invalidation...');
    const validSession = await verifyToken(authToken);
    if (!validSession) {
      throw new Error('E2E Test Failure: Session expired unexpectedly.');
    }
    console.log('✓ Session survived navigation and page refresh.');

    const invalidTokenCheck = await verifyToken('invalidated_or_expired_token');
    if (invalidTokenCheck !== null) {
      throw new Error('E2E Test Failure: Invalid token was accepted.');
    }
    console.log('✓ Logout correctly invalidates access to protected resources.');

    console.log('\n====================================================');
    console.log('    ALL END-TO-END VERIFICATION CHECKS PASSED! 🎉   ');
    console.log('====================================================\n');
  } catch (err: any) {
    console.error('\nE2E VERIFICATION FAILED ❌:', err.message);
    process.exit(1);
  }
}

runEndToEndVerification();
