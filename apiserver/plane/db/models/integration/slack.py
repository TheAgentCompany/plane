# Python imports
import uuid

# Django imports
from django.db import models

# Module imports
from plane.db.models import ProjectBaseModel


class SlackProjectSync(ProjectBaseModel):
    access_token = models.CharField(max_length=300)
    scopes = models.TextField()
    bot_user_id = models.CharField(max_length=50)
    bot_access_token = models.CharField(max_length=300)
    webhook_url = models.URLField(max_length=1000)
    data = models.JSONField(default=dict)
    team_id = models.CharField(max_length=30)
    team_name = models.CharField(max_length=300)

    def __str__(self):
        """Return the repo name"""
        return f"{self.project.name}"

    class Meta:
        verbose_name = "Slack Project Sync"
        verbose_name_plural = "Slack Project Syncs"
        db_table = "slack_project_syncs"
        ordering = ("-created_at",)
