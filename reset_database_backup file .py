import os
import sys
import subprocess
import sqlite3
import traceback
from pathlib import Path
from datetime import datetime

# 1. Setup path and environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'retailer_dash.settings')

# 2. Django Setup
import django
django.setup()

# 3. Third-party / Django imports
from django.conf import settings
from django.core.management import call_command
from django.db import connection
from django.apps import apps
from django.contrib.auth import get_user_model

# 4. Project imports (data_seed)
from data_seed.insert_commodities import insert_commodities
from data_seed.insert_commodity_types import insert_commodity_types
from data_seed.insert_commodity_icons import insert_commodity_icons
from data_seed.insert_static_activity_input_fields import insert_static_activity_input_fields
from data_seed.insert_suppliers import insert_suppliers
from data_seed.insert_store_suppliers import insert_store_suppliers
from data_seed.insert_stores import insert_stores


def dump_database():
    """Dump the current database to a SQL file"""
    db_path = settings.DATABASES['default']['NAME']
    dump_path = BASE_DIR / 'database_dumps' / f'dump_{datetime.now().strftime("%Y%m%d_%H%M%S")}.sql'
    
    # Create dumps directory if it doesn't exist
    dump_path.parent.mkdir(exist_ok=True)
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} does not exist. Skipping dump.")
        return None
    
    print(f"Dumping database to {dump_path}...")
    
    # For SQLite, we can use .dump command
    conn = sqlite3.connect(db_path)
    with open(dump_path, 'w') as f:
        for line in conn.iterdump():
            f.write(f'{line}\n')
    conn.close()
    
    print(f"✓ Database dumped to {dump_path}")
    return dump_path


def drop_database():
    """Drop the current database"""
    db_path = settings.DATABASES['default']['NAME']
    
    if os.path.exists(db_path):
        print(f"Dropping database {db_path}...")
        os.remove(db_path)
        print("✓ Database dropped")
    else:
        print("Database does not exist. Skipping drop.")


def create_tables():
    """Create all database tables from Django models"""
    print("Creating database tables...")
    
    try:
        # Get list of existing tables using Django's introspection
        existing_tables = connection.introspection.table_names()
        
        # Use Django's schema editor to create tables
        with connection.schema_editor() as schema_editor:
            # Get all models from all installed apps
            for app_config in apps.get_app_configs():
                for model in app_config.get_models():
                    table_name = model._meta.db_table
                    
                    # Skip if table already exists
                    if table_name in existing_tables:
                        print(f"  Table {table_name} already exists, skipping...")
                        continue
                    
                    # Create table using schema editor
                    try:
                        schema_editor.create_model(model)
                        print(f"  ✓ Created table: {table_name}")
                    except Exception as e:
                        print(f"  ⚠ Warning creating table {table_name}: {e}")
        
        print("✓ Database tables created")
    except Exception as e:
        print(f"⚠ Warning: Could not create tables automatically: {e}")
        print("You may need to create tables manually or they will be created on first model access.")
        raise


def insert_data():
    """Run the data insertion script"""
    print("\n" + "="*60)
    print("Inserting starting data...")
    print("="*60)

    try:
        print("1. Inserting core reference data...")
        insert_commodities()
        insert_commodity_types()
        # insert_commodity_icons() # Commented out if not needed or file missing, checking existence safely
        insert_static_activity_input_fields()

        print("\n2. Inserting suppliers and pricing...")
        insert_suppliers()

        print("\n3. Inserting stores and inventory...")
        insert_stores()
        insert_store_suppliers()

        print("\n✓ All data inserted successfully")
    except ImportError as e:
        print(f"\n✗ ImportError: {e}")
        print("Make sure all data_seed scripts are in the correct location and __init__.py files exist.")
        raise
    except Exception as e:
        print(f"\n✗ Error inserting data: {e}")
        traceback.print_exc()
        raise


# View SQL files that use PostgreSQL-only syntax (e.g. json_agg); skipped on SQLite.
POSTGRES_ONLY_VIEWS = {'view_commodity_stores.sql'}


def run_all_views_sql():
    """Run all view_*.sql files in database_dumps. Skips PostgreSQL-only views when not using PostgreSQL."""
    dumps_dir = BASE_DIR / 'database_dumps'
    if not dumps_dir.exists():
        return
    view_files = sorted(dumps_dir.glob('view_*.sql'))
    if not view_files:
        return
    print("Creating views...")
    for view_path in view_files:
        name = view_path.name
        if name in POSTGRES_ONLY_VIEWS and connection.vendor != 'postgresql':
            print("  Skipping %s (PostgreSQL only; current DB: %s)" % (name, connection.vendor))
            continue
        try:
            sql = view_path.read_text()
            with connection.cursor() as cursor:
                for stmt in (s.strip() for s in sql.split(';') if s.strip()):
                    cursor.execute(stmt)
            print("  ✓ %s" % name)
        except Exception as e:
            print("  ✗ %s: %s" % (name, e))
            raise


def create_superuser():
    """Create Django superuser"""
    print("\n" + "="*60)
    print("Creating superuser...")
    print("="*60)
    
    try:
        User = get_user_model()
        
        # Create or update superuser
        user, created = User.objects.get_or_create(
            username='root',
            defaults={
                'email': 'root@root.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        # Always set password and ensure permissions
        user.set_password('root')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        if created:
            print("✓ Superuser created successfully")
        else:
            print("✓ Superuser already exists, password and permissions updated")
        
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Password: root")
        
    except Exception as e:
        print(f"\n✗ Error creating superuser: {e}")
        raise


def main():
    """Main reset process"""
    print("="*60)
    print("DATABASE RESET SCRIPT")
    print("="*60)
    print()
    
    # Step 1: Dump current database
    dump_path = dump_database()
    print()
    
    # Step 2: Drop database
    drop_database()
    print()
    
    # Step 3: Create tables
    create_tables()
    print()
    
    # Step 4: Create superuser
    create_superuser()
    print()
    
    # Step 5: Insert data
    insert_data()
    print()

    # Step 6: Run all view SQL
    run_all_views_sql()

    print()
    print("="*60)
    print("DATABASE RESET COMPLETE")
    print("="*60)
    if dump_path:
        print(f"Previous database backed up to: {dump_path}")
    print()


if __name__ == '__main__':
    main()

