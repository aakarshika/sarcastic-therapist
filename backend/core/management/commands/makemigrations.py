from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = "Migrations are disabled in this project."
    requires_system_checks = []
    autodetector = None

    def add_arguments(self, parser):
        # Accept any arguments to avoid parsing errors before we kill it
        parser.add_argument('args', nargs='*')
        parser.add_argument('--noinput', action='store_false')
        parser.add_argument('--empty', action='store_true')
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--merge', action='store_true')
        parser.add_argument('--name', help='Migration name')

    def handle(self, *args, **options):
        raise CommandError(
            "🛑 STOP! Migrations are strictly FORBIDDEN in this project.\n"
            "The database is ephemeral. Use 'reset_db.sh' to recreate the database\n"
            "directly from the models."
        )
