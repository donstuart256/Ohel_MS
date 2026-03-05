from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Client(TenantMixin):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)
    
    # Add any other fields you want to be shared across all tenants
    auto_create_schema = True

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    pass
