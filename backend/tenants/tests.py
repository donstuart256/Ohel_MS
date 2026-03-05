from django.test import TestCase
from tenants.models import Client, Domain

class TenantIntegrationTestCase(TestCase):
    def setUp(self):
        # Create a "public" tenant if it doesn't exist (shared schema)
        self.public_tenant, created = Client.objects.get_or_create(
            schema_name='public',
            name='Public Schema'
        )
        Domain.objects.get_or_create(
            domain='localhost',
            tenant=self.public_tenant,
            is_primary=True
        )

    def test_tenant_creation(self):
        """Test that a new tenant can be created successfully."""
        tenant = Client.objects.create(
            schema_name='test_tenant',
            name='Test Tenant'
        )
        domain = Domain.objects.create(
            domain='test.localhost',
            tenant=tenant,
            is_primary=True
        )
        
        self.assertEqual(tenant.name, 'Test Tenant')
        self.assertEqual(domain.domain, 'test.localhost')
        self.assertTrue(Client.objects.filter(schema_name='test_tenant').exists())
