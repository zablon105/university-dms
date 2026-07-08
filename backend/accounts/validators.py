import re
from django.core.exceptions import ValidationError


def validate_registration_number(value):
    """
    Accepts both:
    - Student reg numbers: COM/0028/2023, SIT/3923/2023
    - Staff employee IDs:  KAFU/STF/001, KAFU/EMP/001
    """
    # Student format: 2-4 letters / 3-4 digits / 4 digit year
    student_pattern = r'^[A-Z]{2,4}\/\d{3,4}\/\d{4}$'

    # Staff format: KAFU/STF/001 or KAFU/EMP/001
    staff_pattern = r'^KAFU\/(STF|EMP)\/\d{3,4}$'

    if not (re.match(student_pattern, value) or
            re.match(staff_pattern, value)):
        raise ValidationError(
            'Invalid username format. '
            'Students: COM/0028/2023 | '
            'Staff: KAFU/STF/001'
        )


def validate_kafu_email(value):
    """
    Accepts any valid email address.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Please enter a valid email address. '
            'e.g. kinzizablon@gmail.com or '
            'kzablon@student.kafu.ac.ke'
        )