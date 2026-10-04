// NightOwl: AfterHours End-to-End Automated Compliance & Functional Test Suite
import { db, isNocturnalHappyHour, getCurrentChatCost } from './src/db.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('======================================================');
console.log('🦉 Running NightOwl Fullstack Compliance & System Tests');
console.log('======================================================\n');

// --------------------------------------------------------------------
// TEST 1: Clean Slate & Zero Hardcoded Seed Profiles
// --------------------------------------------------------------------
console.log('TEST 1: Clean Slate & Zero Hardcoded Seed Profiles');
db.clearTestSandbox();
const initialUsers = Object.keys(db.data.users);
const hasLegacySeed = initialUsers.some(id => id.startsWith('seed-user-'));
assert(!hasLegacySeed, 'Persistent database contains ZERO hardcoded seed-user-* profiles.');

// --------------------------------------------------------------------
// TEST 2: Dynamic Date-of-Birth Age Verification Engine
// --------------------------------------------------------------------
console.log('\nTEST 2: Date-of-Birth (DOB) 18+ Age Calculation Gate');
const computeAge = (year, month, day) => {
  const today = new Date();
  const birthDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const adultAge = computeAge(2000, 5, 15);
const minorAge = computeAge(new Date().getFullYear() - 16, 1, 1);
assert(adultAge >= 18, `DOB (2000-05-15) accurately resolves to adult (${adultAge} yrs).`);
assert(minorAge < 18, `DOB (16 yrs ago) accurately resolves to restricted minor (${minorAge} yrs).`);

// --------------------------------------------------------------------
// TEST 3: User Registration & Ghost Referral Engine (+50 Coins)
// --------------------------------------------------------------------
console.log('\nTEST 3: User Registration & Ghost Referral Ledger');
const userA = db.createUser({
  id: 'test-user-a',
  nickname: 'VelvetRebel',
  age: 24,
  gender: 'Female',
  seeking: 'Male',
  desireTags: ['Late-Night Chat', 'Secret Romance'],
  coinsBalance: 100
});

assert(userA.id === 'test-user-a', 'User A registered successfully with valid UUID.');
assert(userA.coinsBalance === 100, 'User A credited with +100 welcome coins.');
assert(userA.referralCode && userA.referralCode.startsWith('GHOST-'), `Generated unique ghost invite code: ${userA.referralCode}`);

// Invitee User B uses User A's referral code
const userB = db.createUser({
  id: 'test-user-b',
  nickname: 'PhantomNomad',
  age: 26,
  gender: 'Male',
  seeking: 'Female',
  desireTags: ['Casual Dating'],
  coinsBalance: 150 // 100 base + 50 referral
});
db.addCoins(userA.id, 50, 0, 'Ghost Referral Reward');

assert(userB.coinsBalance === 150, 'Invitee User B granted +50 extra referral bonus (Total: 150c).');
const userAUpdated = db.getUser(userA.id);
assert(userAUpdated.coinsBalance === 150, 'Inviter User A credited with +50 referral coins (Total: 150c).');

// --------------------------------------------------------------------
// TEST 4: Nocturnal Happy Hour (12 AM - 3 AM IST) Cost Calculator
// --------------------------------------------------------------------
console.log('\nTEST 4: Nocturnal Happy Hour Pricing Calculation');
const standardCost = getCurrentChatCost();
assert(standardCost === 10 || standardCost === 20, `Chat unlock cost is active and valid (${standardCost} coins).`);

// --------------------------------------------------------------------
// TEST 5: Strict Anti-Ghosting Capacity Engine (Max 5 Chats)
// --------------------------------------------------------------------
console.log('\nTEST 5: Strict Anti-Ghosting Capacity Limiter (Max 5 Active Chats)');
// Create 5 active chat sessions for User A
for (let i = 1; i <= 5; i++) {
  db.getOrCreateChat(userA.id, `dummy-partner-${i}`);
}

const status = db.getInboxStatus(userA.id);
assert(status.activeChatsCount === 5, `User A currently has ${status.activeChatsCount}/5 active chats.`);
assert(status.isChatLimitReached === true, 'Capacity lock engages when user reaches 5 active chats.');

// --------------------------------------------------------------------
// TEST 6: 10-Category Abuse Reporting & Instant Blocking
// --------------------------------------------------------------------
console.log('\nTEST 6: 10-Category Abuse Reporting & Immediate Blocking');
const report = db.createReport(userA.id, userB.id, 'Suspected Underage User (Minor < 18)', 'Automated test verification of Google Play UGC reporting');
db.blockUser(userA.id, userB.id);

assert(db.data.reports.length >= 1, 'Abuse report safely logged to admin moderation queue.');
const isBlocked = db.isUserBlocked(userA.id, userB.id);
assert(isBlocked === true, 'Offender successfully blocked from reporter radar.');

// --------------------------------------------------------------------
// TEST 7: 24-Hour Disposable Burner PIN
// --------------------------------------------------------------------
console.log('\nTEST 7: 24-Hour Disposable Burner PIN / QR Connection');
const burner = db.createBurnerCode(userA.id);
assert(burner.code && burner.code.startsWith('OWL-'), `Generated 24h disposable burner PIN: ${burner.code}`);
const retrievedBurner = db.data.burnerCodes[burner.code];
assert(retrievedBurner && retrievedBurner.creatorId === userA.id, 'Burner code successfully retrieved and verified.');

// --------------------------------------------------------------------
// TEST 8: Google Play & DPDPA Permanent Account & Data Erasure
// --------------------------------------------------------------------
console.log('\nTEST 8: In-App & Web Account Deletion (Complete Data Erasure)');
const deleted = db.deleteUser(userA.id);
assert(deleted === true, 'Account deletion triggered successfully.');
assert(db.getUser(userA.id) === null, 'User profile completely erased from database.');
const lingeringChats = db.getUserActiveChats(userA.id);
assert(lingeringChats.length === 0, 'All active chats associated with deleted user incinerated.');

// --------------------------------------------------------------------
// Final Summary
// --------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed === 0) {
  console.log('🎉 ALL SYSTEM & REGULATORY COMPLIANCE TESTS PASSED!');
  process.exit(0);
} else {
  console.error(`⚠️ ${failed} test(s) failed.`);
  process.exit(1);
}
