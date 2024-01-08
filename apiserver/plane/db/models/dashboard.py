# Django imports
from django.db import models
from django.conf import settings

# Module imports
from . import BaseModel
from ..mixins import TimeAuditModel

class Dashboard(BaseModel):
    DASHBOARD_CHOICES = (
        ("workspace", "Workspace"),
        ("project", "Project"),
        ("home", "Home"),
        ("team", "Team"),
        ("user", "User"),
    )
    name = models.CharField(max_length=255)
    description_html = models.TextField(blank=True, default="<p></p>")
    identifier = models.UUIDField(null=True)
    owned_by = models.ForeignKey(
        "db.User",
        on_delete=models.CASCADE,
        related_name="dashboards",
    )
    is_default = models.BooleanField(default=False)
    type = models.CharField(
        max_length=30,
        choices=DASHBOARD_CHOICES,
        verbose_name="Dashboard Type",
        default="home",
    )

    def __str__(self):
        """Return name of the dashboard"""
        return f"{self.name}"

    class Meta:
        verbose_name = "Dashboard"
        verbose_name_plural = "Dashboards"
        db_table = "dashboards"
        ordering = ("name",)


class Widget(TimeAuditModel):
    key = models.CharField(max_length=255)
    filters = models.JSONField(default=dict)

    def __str__(self):
        """Return name of the widget"""
        return f"{self.key}"

    class Meta:
        verbose_name = "Widget"
        verbose_name_plural = "Widgets"
        db_table = "widgets"
        ordering = ("-created_at",)


class DashboardWidget(BaseModel):
    widget = models.ForeignKey(
        Widget,
        on_delete=models.CASCADE,
        related_name="dashboard_widgets",
    )
    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE,
        related_name="dashboard_widgets",
    )
    is_visible = models.BooleanField(default=False)
    sort_order = models.FloatField(default=65535)
    filters = models.JSONField(default=dict)
    properties = models.JSONField(default=dict)

    def __str__(self):
        """Return name of the dashboard"""
        return f"{self.dashboard.name} {self.widget.key}"

    class Meta:
        unique_together = ("widget", "dashboard")
        verbose_name = "Dashboard Widget"
        verbose_name_plural = "Dashboard Widgets"
        db_table = "dashboard_widgets"
        ordering = ("-created_at",)
