# Generated by Django 4.2.11 on 2024-07-01 06:10

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


def create_issue_types(apps, schema_editor):
    Project = apps.get_model("db", "Project")
    Issue = apps.get_model("db", "Issue")
    IssueType = apps.get_model("db", "IssueType")
    # Create the issue types for all projects
    IssueType.objects.bulk_create(
        [
            IssueType(
                name="Task",
                description="A task that needs to be completed.",
                project_id=project["id"],
                workspace_id=project["workspace_id"],
            )
            for project in Project.objects.values("id", "workspace_id")
        ],
        batch_size=1000,
    )
    # Update the issue type for all existing issues
    issue_types = {
        str(issue_type["project_id"]): str(issue_type["id"])
        for issue_type in IssueType.objects.values("id", "project_id")
    }
    # Update the issue type for all existing issues
    bulk_issues = []
    for issue in Issue.objects.all():
        issue.type_id = issue_types[str(issue.project_id)]
        bulk_issues.append(issue)

    # Update the issue type for all existing issues
    Issue.objects.bulk_update(bulk_issues, ["type_id"], batch_size=1000)


def create_page_versions(apps, schema_editor):
    Page = apps.get_model("db", "Page")
    PageVersion = apps.get_model("db", "PageVersion")
    # Create the page versions for all pages
    PageVersion.objects.bulk_create(
        [
            PageVersion(
                page_id=page["id"],
                workspace_id=page["workspace_id"],
                description_html=page["description_html"],
                description_binary=page["description_binary"],
                description_stripped=page["description_stripped"],
                ownned_by_id=page["owned_by_id"],
                last_saved_at=page["updated_at"],
            )
            for page in Page.objects.values(
                "id",
                "workspace_id",
                "description_html",
                "description_binary",
                "description_stripped",
                "owned_by_id",
                "updated_at",
            )
        ],
        batch_size=1000,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0069_alter_account_provider_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="IssueType",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Created At"
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True, verbose_name="Last Modified At"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("logo_props", models.JSONField(default=dict)),
                ("sort_order", models.FloatField(default=65535)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_created_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Created By",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_%(class)s",
                        to="db.project",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_updated_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="workspace_%(class)s",
                        to="db.workspace",
                    ),
                ),
                (
                    "is_default",
                    models.BooleanField(default=True),
                ),
            ],
            options={
                "verbose_name": "Issue Type",
                "verbose_name_plural": "Issue Types",
                "db_table": "issue_types",
                "ordering": ("sort_order",),
            },
        ),
        migrations.AddField(
            model_name="issue",
            name="type",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="issue_type",
                to="db.issuetype",
            ),
        ),
        migrations.AddField(
            model_name="apitoken",
            name="is_service",
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(create_issue_types),
        migrations.CreateModel(
            name="PageVersion",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Created At"
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True, verbose_name="Last Modified At"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                (
                    "last_saved_at",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                ("description_binary", models.BinaryField(null=True)),
                (
                    "description_html",
                    models.TextField(blank=True, default="<p></p>"),
                ),
                (
                    "description_stripped",
                    models.TextField(blank=True, null=True),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_created_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Created By",
                    ),
                ),
                (
                    "ownned_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="page_versions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "page",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="page_versions",
                        to="db.page",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_updated_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="page_versions",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Page Version",
                "verbose_name_plural": "Page Versions",
                "db_table": "page_versions",
                "ordering": ("-created_at",),
            },
        ),
        migrations.AddField(
            model_name="exporterhistory",
            name="filters",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="exporterhistory",
            name="name",
            field=models.CharField(
                blank=True,
                max_length=255,
                null=True,
                verbose_name="Exporter Name",
            ),
        ),
        migrations.AddField(
            model_name="exporterhistory",
            name="type",
            field=models.CharField(
                choices=[
                    ("issue_exports", "Issue Exports"),
                    ("issue_work_logs", "Issue Work Logs"),
                ],
                default="issue_exports",
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="is_time_tracking_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="project",
            name="start_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="project",
            name="target_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(create_page_versions),
    ]
