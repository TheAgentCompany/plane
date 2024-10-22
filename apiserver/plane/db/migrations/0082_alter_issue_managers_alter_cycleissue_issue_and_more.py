# Generated by Django 4.2.15 on 2024-10-21 13:59

from django.db import migrations, models
import django.db.models.deletion
import django.db.models.manager


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0081_remove_globalview_created_by_and_more"),
    ]

    operations = [
        migrations.AlterModelManagers(
            name="issue",
            managers=[
                ("issue_objects", django.db.models.manager.Manager()),
            ],
        ),
        migrations.AlterField(
            model_name="cycleissue",
            name="issue",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="issue_cycle",
                to="db.issue",
            ),
        ),
        migrations.AlterField(
            model_name="draftissuecycle",
            name="draft_issue",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="draft_issue_cycle",
                to="db.draftissue",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="cycleissue",
            unique_together={("issue", "cycle", "deleted_at")},
        ),
        migrations.AlterUniqueTogether(
            name="draftissuecycle",
            unique_together={("draft_issue", "cycle", "deleted_at")},
        ),
        migrations.AddConstraint(
            model_name="cycleissue",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("cycle", "issue"),
                name="cycle_issue_when_deleted_at_null",
            ),
        ),
        migrations.AddConstraint(
            model_name="draftissuecycle",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("draft_issue", "cycle"),
                name="draft_issue_cycle_when_deleted_at_null",
            ),
        ),
    ]
