# Generated by Django 4.2.16 on 2024-10-15 08:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0080_fileasset_draft_issue_alter_fileasset_entity_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='issuetype',
            name='external_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='issuetype',
            name='external_source',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
