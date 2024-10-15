# Generated by Django 4.2.15 on 2024-10-09 06:19

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import plane.db.models.asset


class Migration(migrations.Migration):

    dependencies = [
        (
            "db",
            "0077_draftissue_cycle_user_timezone_project_user_timezone_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="fileasset",
            name="comment",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assets",
                to="db.issuecomment",
            ),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="entity_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("ISSUE_ATTACHMENT", "Issue Attachment"),
                    ("ISSUE_DESCRIPTION", "Issue Description"),
                    ("COMMENT_DESCRIPTION", "Comment Description"),
                    ("PAGE_DESCRIPTION", "Page Description"),
                    ("USER_COVER", "User Cover"),
                    ("USER_AVATAR", "User Avatar"),
                    ("WORKSPACE_LOGO", "Workspace Logo"),
                    ("PROJECT_COVER", "Project Cover"),
                ],
                max_length=255,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="external_id",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="external_source",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="is_uploaded",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="issue",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assets",
                to="db.issue",
            ),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="page",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assets",
                to="db.page",
            ),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="project",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assets",
                to="db.project",
            ),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="size",
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="storage_metadata",
            field=models.JSONField(blank=True, default=dict, null=True),
        ),
        migrations.AddField(
            model_name="fileasset",
            name="user",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="assets",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="cover_image_asset",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="project_cover_image",
                to="db.fileasset",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="avatar_asset",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="user_avatar",
                to="db.fileasset",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="cover_image_asset",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="user_cover_image",
                to="db.fileasset",
            ),
        ),
        migrations.AddField(
            model_name="workspace",
            name="logo_asset",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="workspace_logo",
                to="db.fileasset",
            ),
        ),
        migrations.AlterField(
            model_name="fileasset",
            name="asset",
            field=models.FileField(
                max_length=800, upload_to=plane.db.models.asset.get_upload_path
            ),
        ),
        migrations.AlterField(
            model_name="integration",
            name="avatar_url",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="project",
            name="cover_image",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="workspace",
            name="logo",
            field=models.TextField(blank=True, null=True, verbose_name="Logo"),
        ),
    ]
