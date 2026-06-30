import requests

# Login
login = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
    'username': 'admin',
    'password': 'Kinzi@0023'
})
token = login.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# Submit document 1 for approval
submit = requests.post(
    'http://127.0.0.1:8000/api/workflows/submit/1/',
    headers=headers,
    json={'request_note': 'Please review this document.'}
)
print("SUBMIT:", submit.status_code, submit.json()['status'])

# Get the approval ID
approval_id = submit.json()['id']

# Approve it
review = requests.post(
    f'http://127.0.0.1:8000/api/workflows/review/{approval_id}/',
    headers=headers,
    json={'action': 'approve', 'review_note': 'Looks good!'}
)
print("REVIEW:", review.status_code, review.json()['status'])

# Check pending approvals
pending = requests.get('http://127.0.0.1:8000/api/workflows/pending/', headers=headers)
print("PENDING COUNT:", len(pending.json()))