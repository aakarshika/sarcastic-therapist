import os
import sys
import shutil
from pathlib import Path

# 1. Setup path and environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# 2. Django Setup
import django
from django.conf import settings
from django.db import connection
from django.apps import apps
from django.contrib.auth import get_user_model

def clean_migrations():
    """Delete all migration files."""
    print("Cleaning migration files...")
    for root, dirs, files in os.walk(BASE_DIR):
        if 'migrations' in dirs:
            migrations_dir = os.path.join(root, 'migrations')
            for filename in os.listdir(migrations_dir):
                if filename != '__init__.py' and (filename.endswith('.py') or filename.endswith('.pyc')):
                    file_path = os.path.join(migrations_dir, filename)
                    try:
                        os.remove(file_path)
                        # print(f"  Deleted: {file_path}")
                    except Exception as e:
                        print(f"  Error deleting {file_path}: {e}")
            
            # Also remove __pycache__ if it exists
            pycache_dir = os.path.join(migrations_dir, '__pycache__')
            if os.path.exists(pycache_dir):
                shutil.rmtree(pycache_dir)
    print("✓ Migration files cleaned")

def drop_database():
    """Drop the SQLite database file."""
    db_path = BASE_DIR / 'db.sqlite3'
    if db_path.exists():
        print(f"Dropping database {db_path}...")
        try:
            os.remove(db_path)
            print("✓ Database dropped")
        except Exception as e:
            print(f"Error dropping database: {e}")
            sys.exit(1)
    else:
        print("Database does not exist. Skipping drop.")

def create_tables():
    """Create all database tables from Django models."""
    print("Creating database tables...")
    
    django.setup()
    
    try:
        with connection.schema_editor() as schema_editor:
            for app_config in apps.get_app_configs():
                for model in app_config.get_models():
                    table_name = model._meta.db_table
                    try:
                        schema_editor.create_model(model)
                        print(f"  ✓ Created table: {table_name}")
                    except Exception as e:
                        # Some tables might depend on others or be created implicitly
                        print(f"  ⚠ Warning creating table {table_name}: {e}")
        print("✓ Database tables created")
    except Exception as e:
        print(f"✗ Critical error creating tables: {e}")
        # sys.exit(1) # Don't exit yet, try to continue or debug

def create_superuser():
    """Create default superuser."""
    print("\nCreating superuser...")
    try:
        User = get_user_model()
        if not User.objects.filter(username='root').exists():
            User.objects.create_superuser('root', 'root@root.com', 'root')
            print("✓ Superuser 'root' created")
        else:
            print("✓ Superuser 'root' already exists")
    except Exception as e:
        print(f"✗ Error creating superuser: {e}")

def main():
    print("="*60)
    print("DATABASE RESET SCRIPT (NO MIGRATIONS)")
    print("="*60)
    
    clean_migrations()
    drop_database()
    create_tables()
    create_superuser()
    
    print("\n" + "="*60)
    print("RESET COMPLETE")
    print("="*60)

if __name__ == '__main__':
    main()
