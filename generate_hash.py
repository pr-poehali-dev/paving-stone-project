import bcrypt
password = "admin"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(hashed.decode('utf-8'))
