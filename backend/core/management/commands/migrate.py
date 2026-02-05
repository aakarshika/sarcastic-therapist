from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = "Migrations are disabled in this project."
    requires_system_checks = []
    autodetector = None

    def add_arguments(self, parser):
        # Accept any arguments to avoid parsing errors
        parser.add_argument('args', nargs='*')
        parser.add_argument('--noinput', action='store_false')
        parser.add_argument('--fake', action='store_true')
        parser.add_argument('--fake-initial', action='store_true')
        parser.add_argument('--plan', action='store_true')
        parser.add_argument('--run-syncdb', action='store_true')
        parser.add_argument('--check', action='store_true')

    def handle(self, *args, **options):
        raise CommandError(
            "🛑 STOP! Migrations are strictly FORBIDDEN in this project.\n"
            "The database is ephemeral. Use 'reset_db.sh' to recreate the database\n"
            "directly from the models."
        )
