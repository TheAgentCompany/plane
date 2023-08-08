# Generated by Django 4.2.3 on 2023-08-04 09:12
import string
import random
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def generate_display_name(apps, schema_editor):
    UserModel = apps.get_model("db", "User")
    updated_users = []
    for obj in UserModel.objects.all():
        obj.display_name = (
            obj.email.split("@")[0]
            if len(obj.email.split("@"))
            else "".join(random.choice(string.ascii_letters) for _ in range(6))
        )
        updated_users.append(obj)
    UserModel.objects.bulk_update(updated_users, ["display_name"], batch_size=100)


def rectify_field_issue_activity(apps, schema_editor):
    Model = apps.get_model("db", "IssueActivity")
    updated_activity = []
    for obj in Model.objects.filter(field="assignee"):
        obj.field = "assignees"
        updated_activity.append(obj)

    Model.objects.bulk_update(updated_activity, ["field"], batch_size=100)


def update_assignee_issue_activity(apps, schema_editor):
    Model = apps.get_model("db", "IssueActivity")
    updated_activity = []

    # Get all the users
    User = apps.get_model("db", "User")
    users = User.objects.values("id", "email", "display_name")

    for obj in Model.objects.filter(field="assignees"):
        if bool(obj.new_value) and not bool(obj.old_value):
            # Get user from list
            assigned_user = [
                user for user in users if user.get("email") == obj.new_value
            ]
            if assigned_user:
                obj.new_value = assigned_user[0].get("display_name")
                obj.new_identifier = assigned_user[0].get("id")
                # Update the comment
                words = obj.comment.split()
                words[-1] = assigned_user[0].get("display_name")
                obj.comment = " ".join(words)

        if bool(obj.old_value) and not bool(obj.new_value):
            # Get user from list
            assigned_user = [
                user for user in users if user.get("email") == obj.old_value
            ]
            if assigned_user:
                obj.old_value = assigned_user[0].get("display_name")
                obj.old_identifier = assigned_user[0].get("id")
                # Update the comment
                words = obj.comment.split()
                words[-1] = assigned_user[0].get("display_name")
                obj.comment = " ".join(words)

        updated_activity.append(obj)

    Model.objects.bulk_update(
        updated_activity,
        ["old_value", "new_value", "old_identifier", "new_identifier", "comment"],
        batch_size=200,
    )


def update_name_activity(apps, schema_editor):
    Model = apps.get_model("db", "IssueActivity")
    update_activity = []
    for obj in Model.objects.filter(field="name"):
        obj.comment = obj.comment.replace("start date", "name")
        update_activity.append(obj)

    Model.objects.bulk_update(update_activity, ["comment"], batch_size=1000)


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0040_projectmember_preferences_user_cover_image_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="display_name",
            field=models.CharField(default="", max_length=255),
        ),
        migrations.RunPython(generate_display_name),
        migrations.RunPython(rectify_field_issue_activity),
        migrations.RunPython(update_assignee_issue_activity),
        migrations.RunPython(update_name_activity),
    ]
