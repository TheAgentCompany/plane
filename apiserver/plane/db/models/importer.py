# Django imports
from django.db import models
from django.conf import settings

# Module imports
from . import ProjectBaseModel


class Importer(ProjectBaseModel):
    service = models.CharField(max_length=50, choices=(("github", "GitHub"),))
    status = models.CharField(
        max_length=50,
        choices=(
            ("queued", "Queued"),
            ("processing", "Processing"),
            ("completed", "Completed"),
            ("failed", "Failed"),
        ),
        default="queued",
    )
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="imports"
    )
    metadata = models.JSONField(default=dict)

    class Meta:
        verbose_name = "Importer"
        verbose_name_plural = "Importers"
        db_table = "importers"
        ordering = ("-created_at",)

    def __str__(self):
        """Return name of the service"""
        return f"{self.service} <{self.project.name}>"
