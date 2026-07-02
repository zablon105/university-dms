import re
from django.core.exceptions import ValidationError


def validate_registration_number(value):
    """
    Valid formats:
    COM/0028/2023
    SIT/3923/2023
    BUS/1234/2022
    ENG/0001/2024
    Also allows standard alphanumeric usernames for superusers/admins.
    """
    # Regular students/staff format
    reg_pattern = r'^[A-Z]{2,4}\/\d{3,4}\/\d{4}$'
    # Regular django username format (admins, superusers)
    admin_pattern = r'^[\w.@+-]+$'
    
    if not (re.match(reg_pattern, value) or re.match(admin_pattern, value)):
        raise ValidationError(
            'Username must be a valid registration number (e.g. COM/0028/2023) '
            'or a standard alphanumeric username.'
        )


def validate_kafu_email(value):
    """
    Accepts:
    - Any valid email (gmail, yahoo, etc.)
    - KAFU institutional emails
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Please enter a valid email address. '
            'e.g. kinzizablon@gmail.com or kzablon@student.kafu.ac.ke'
        )