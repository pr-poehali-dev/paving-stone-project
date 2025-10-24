import subprocess
import sys

# Install bcrypt
subprocess.check_call([sys.executable, "-m", "pip", "install", "bcrypt==4.0.1", "-q"])

# Now run the hash generation
import bcrypt
password = "admin"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(hashed.decode('utf-8'))
