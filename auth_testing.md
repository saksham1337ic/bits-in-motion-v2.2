# Auth-Gated App Testing Playbook (BITS in Motion)

Emergent-managed Google Auth. Guests use localStorage; Google users are cloud-synced.

## Step 1: Create Test User & Session
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({ user_id: userId, email: 'test.user.'+Date.now()+'@example.com', name: 'Test User', picture: 'https://via.placeholder.com/150', created_at: new Date() });
db.user_sessions.insertOne({ user_id: userId, session_token: sessionToken, expires_at: new Date(Date.now()+7*24*60*60*1000), created_at: new Date() });
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```
curl -X GET "$BASE/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$BASE/api/data" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X PUT "$BASE/api/data" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"profile":{"age":21,"goal":"strength","equipment":"none","lowImpact":false},"history":[],"settings":{"sound":true,"voice":false},"meal":null}'
curl -X POST "$BASE/api/meal/generate" -H "Content-Type: application/json" \
  -d '{"goal":"strength","diet":"veg","allergies":"peanuts","budget":"low","age":21,"equipment":"none"}'
```

## Step 3: Browser Testing (set cookie for the preview domain)
```
await page.context.add_cookies([{ "name":"session_token","value":"YOUR_SESSION_TOKEN","domain":"camera-coach-6.preview.emergentagent.com","path":"/","httpOnly":true,"secure":true,"sameSite":"None" }])
await page.goto("https://camera-coach-6.preview.emergentagent.com/app")
```

## Notes
- Callback detection uses `useLocation().hash` (session_id in URL fragment) at route `/app`.
- Google redirect target is `window.location.origin + '/app'` (never hardcoded).
- Guest → Google merge happens once on first sign-in via POST /api/auth/session body `{guest_data}`.

## Clean test data
```
mongosh --eval "use('test_database'); db.users.deleteMany({email:/test\\.user\\./}); db.user_sessions.deleteMany({session_token:/test_session/}); db.user_data.deleteMany({user_id:/test-user-/});"
```
