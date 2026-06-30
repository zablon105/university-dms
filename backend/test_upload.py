import requests

# First login to get token
login = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
    'username': 'admin',
    'password': 'Kinzi@0023'
})
token = login.json()['access']

# Upload a document
with open(r'D:\zablon\zablon\learning equipments\my office\1AM CRT.pdf', 'rb') as f:
    response = requests.post(
        'http://127.0.0.1:8000/api/documents/',
        headers={'Authorization': f'Bearer {token}'},
        data={
            'title': 'My First Document',
            'description': 'Test upload',
            'category': '1',
            'visibility': 'public',
            'status': 'draft',
        },
        files={'file': ('1AM CRT.pdf', f, 'application/pdf')}
    )

print(response.status_code)
try:
    print(response.json())
except Exception:
    print(response.text)