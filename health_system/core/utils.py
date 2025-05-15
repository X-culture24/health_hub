from rest_framework.permissions import BasePermission

def filter_by_permission(queryset, user):
    """
    Filter queryset based on user permissions.
    Only doctors and nurses can see all records.
    Regular users can only see their own records.
    """
    if user.is_doctor or user.is_nurse:
        return queryset
    
    # Get model name to determine filtering logic
    model_name = queryset.model.__name__
    
    if model_name == 'HealthProgram':
        return queryset.filter(created_by=user)
    elif model_name == 'Enrollment':
        return queryset.filter(enrolled_by=user)
    elif model_name == 'Prescription':
        return queryset.filter(prescribed_by=user)
    elif model_name == 'Metric':
        return queryset.filter(recorded_by=user)
    elif model_name == 'Appointment':
        return queryset.filter(scheduled_with=user)
    else:
        return queryset 