# # Generated by Django 4.2.7 on 2024-05-24 09:47
# Python imports
import uuid
from uuid import uuid4
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import plane.db.models.deploy_board


def issue_estimate_point(apps, schema_editor):
    Issue = apps.get_model("db", "Issue")
    Project = apps.get_model("db", "Project")
    EstimatePoint = apps.get_model("db", "EstimatePoint")
    IssueActivity = apps.get_model("db", "IssueActivity")
    updated_estimate_point = []
    updated_issue_activity = []

    # loop through all the projects
    for project in Project.objects.filter(estimate__isnull=False):
        estimate_points = EstimatePoint.objects.filter(
            estimate=project.estimate, project=project
        )

        for issue_activity in IssueActivity.objects.filter(
            field="estimate_point", project=project
        ):
            if issue_activity.new_value:
                new_identifier = estimate_points.filter(
                    key=issue_activity.new_value
                ).first().id
                issue_activity.new_identifier = new_identifier
                new_value = estimate_points.filter(
                    key=issue_activity.new_value
                ).first().value
                issue_activity.new_value = new_value
                
            if issue_activity.old_value:
                old_identifier = estimate_points.filter(
                    key=issue_activity.old_value
                ).first().id
                issue_activity.old_identifier = old_identifier
                old_value = estimate_points.filter(
                    key=issue_activity.old_value
                ).first().value
                issue_activity.old_value = old_value
            updated_issue_activity.append(issue_activity)

        for issue in Issue.objects.filter(
            point__isnull=False, project=project
        ):
            # get the estimate id for the corresponding estimate point in the issue
            estimate = estimate_points.filter(key=issue.point).first()
            issue.estimate_point = estimate
            updated_estimate_point.append(issue)

    Issue.objects.bulk_update(
        updated_estimate_point, ["estimate_point"], batch_size=1000
    )
    IssueActivity.objects.bulk_update(
        updated_issue_activity,
        ["new_value", "old_value", "new_identifier", "old_identifier"],
        batch_size=1000,
    )


def issue_activity_estimate_point(apps, schema_editor):
    Project = apps.get_model("db", "Project")
    EstimatePoint = apps.get_model("db", "EstimatePoint")
    Issue = apps.get_model("db", "Issue")
    updated_estimate_point = []

    # loop through all the projects
    for project in Project.objects.filter(estimate__isnull=False):
        estimate_points = EstimatePoint.objects.filter(
            estimate=project.estimate, project=project
        )
        for issue in Issue.objects.filter(
            point__isnull=False, project=project
        ):
            # get the estimate id for the corresponding estimate point in the issue
            estimate = estimate_points.filter(key=issue.point).first()
            issue.estimate_point = estimate
            updated_estimate_point.append(issue)

    Issue.objects.bulk_update(
        updated_estimate_point, ["estimate_point"], batch_size=1000
    )


def last_used_estimate(apps, schema_editor):
    Project = apps.get_model("db", "Project")
    Estimate = apps.get_model("db", "Estimate")

    # Get all estimate ids used in projects
    estimate_ids = Project.objects.filter(estimate__isnull=False).values_list(
        "estimate", flat=True
    )

    # Update all matching estimates
    Estimate.objects.filter(id__in=estimate_ids).update(last_used=True)


def populate_deploy_board(apps, schema_editor):
    DeployBoard = apps.get_model("db", "DeployBoard")
    ProjectDeployBoard = apps.get_model("db", "ProjectDeployBoard")

    DeployBoard.objects.bulk_create(
        [
            DeployBoard(
                entity_identifier=deploy_board.project_id,
                project_id=deploy_board.project_id,
                entity_name="project",
                anchor=uuid4().hex,
                comments=deploy_board.comments,
                reactions=deploy_board.reactions,
                inbox=deploy_board.inbox,
                votes=deploy_board.votes,
                view_props=deploy_board.views,
                workspace_id=deploy_board.workspace_id,
                created_at=deploy_board.created_at,
                updated_at=deploy_board.updated_at,
                created_by_id=deploy_board.created_by_id,
                updated_by_id=deploy_board.updated_by_id,
            )
            for deploy_board in ProjectDeployBoard.objects.all()
        ],
        batch_size=100,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0066_account_id_token_cycle_logo_props_module_logo_props"),
    ]

    operations = [
        migrations.CreateModel(
            name="DeployBoard",
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
                ("entity_identifier", models.UUIDField(null=True)),
                (
                    "entity_name",
                    models.CharField(
                        choices=[
                            ("project", "Project"),
                            ("issue", "Issue"),
                            ("module", "Module"),
                            ("cycle", "Task"),
                            ("page", "Page"),
                            ("view", "View"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "anchor",
                    models.CharField(
                        db_index=True,
                        default=plane.db.models.deploy_board.get_anchor,
                        max_length=255,
                        unique=True,
                    ),
                ),
                ("comments", models.BooleanField(default=False)),
                ("reactions", models.BooleanField(default=False)),
                ("votes", models.BooleanField(default=False)),
                ("view_props", models.JSONField(default=dict)),
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
                    "inbox",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="board_inbox",
                        to="db.inbox",
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
            ],
            options={
                "verbose_name": "Deploy Board",
                "verbose_name_plural": "Deploy Boards",
                "db_table": "deploy_boards",
                "ordering": ("-created_at",),
                "unique_together": {("entity_name", "entity_identifier")},
            },
        ),
        migrations.AddField(
            model_name="estimate",
            name="last_used",
            field=models.BooleanField(default=False),
        ),
        # Rename the existing field
        migrations.RenameField(
            model_name="issue",
            old_name="estimate_point",
            new_name="point",
        ),
        # Add a new field with the original name as a foreign key
        migrations.AddField(
            model_name="issue",
            name="estimate_point",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="issue_estimates",
                to="db.EstimatePoint",
                blank=True,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="estimate",
            name="type",
            field=models.CharField(default="categories", max_length=255),
        ),
        migrations.AlterField(
            model_name="estimatepoint",
            name="value",
            field=models.CharField(max_length=255),
        ),
        migrations.RunPython(issue_estimate_point),
        migrations.RunPython(last_used_estimate),
        migrations.RunPython(populate_deploy_board),
    ]
