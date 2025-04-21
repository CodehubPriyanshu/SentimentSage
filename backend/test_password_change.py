from models.mongo import User
from werkzeug.security import generate_password_hash, check_password_hash
from db.mongo_client import get_db
import json

print('Testing password change functionality...')

# Create a test user ID (this should be a valid ObjectId in your database)
test_email = 'test@example.com'

# Find the test user
user = User.find_by_email(test_email)

if not user:
    print(f'Test user with email {test_email} not found. Creating test user...')
    try:
        user = User.create(
            email=test_email,
            password='OldPassword123!',
            full_name='Test User'
        )
        print('Test user created successfully!')
    except Exception as e:
        print(f'Error creating test user: {str(e)}')
        exit(1)
else:
    print(f'Found existing test user with email {test_email}')

# Test password verification
print('\nTesting password verification...')
old_password = 'OldPassword123!'
new_password = 'NewPassword456@'

# Verify old password
is_valid = User.verify_password(user, old_password)
print(f'Old password verification: {"Success" if is_valid else "Failed"}')

# Update password
print('\nUpdating password...')
success = User.update_password(user['_id'], new_password)
print(f'Password update: {"Success" if success else "Failed"}')

# Verify new password
print('\nVerifying new password...')
updated_user = User.find_by_email(test_email)
is_valid = User.verify_password(updated_user, new_password)
print(f'New password verification: {"Success" if is_valid else "Failed"}')

# Verify old password no longer works
print('\nVerifying old password no longer works...')
is_valid = User.verify_password(updated_user, old_password)
print(f'Old password should not work: {"Failed (as expected)" if not is_valid else "Unexpectedly succeeded"}')

# Reset to original password for future tests
print('\nResetting to original password...')
success = User.update_password(user['_id'], old_password)
print(f'Password reset: {"Success" if success else "Failed"}')

print('\nPassword change functionality test completed!')
