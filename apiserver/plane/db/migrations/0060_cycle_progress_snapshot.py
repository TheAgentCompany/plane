# Generated by Django 4.2.7 on 2024-02-08 09:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0059_auto_20240208_0957"),
    ]

    operations = [
        migrations.AddField(
            model_name="cycle",
            name="progress_snapshot",
            field=models.JSONField(default=dict),
        ),
    ]
