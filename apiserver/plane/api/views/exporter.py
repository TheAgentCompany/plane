# Third Party imports
from rest_framework.response import Response
from rest_framework import status
from sentry_sdk import capture_exception

# Module imports
from . import BaseAPIView
from plane.api.permissions import WorkSpaceAdminPermission
from plane.bgtasks.export_task import issue_export_task
from plane.db.models import Project, ExporterHistory, Workspace

from plane.api.serializers import ExporterHistorySerializer


class ExportIssuesEndpoint(BaseAPIView):
    permission_classes = [
        WorkSpaceAdminPermission,
    ]
    model = ExporterHistory
    serializer_class = ExporterHistorySerializer

    def post(self, request, slug):
        try:
            provider = request.data.get("provider", False)
            multiple = request.data.get("multiple", False)
            project_ids = request.data.get("project", [])

            workspace = Workspace.objects.get(slug=slug)
            if provider in ["csv", "xlsx", "json"]:
                if not project_ids:
                    project_ids = Project.objects.filter(
                        workspace__slug=slug
                    ).values_list("id", flat=True)
                    project_ids = [str(project_id) for project_id in project_ids]
                    
                exporter = ExporterHistory.objects.create(
                    workspace=workspace,
                    project=project_ids,
                    initiated_by=request.user,
                    provider=provider,
                )
                token_id = exporter.token

                issue_export_task.delay(
                    provider=provider,
                    workspace_id=workspace.id,
                    project_ids=project_ids,
                    token_id=token_id,
                    multiple=multiple,
                )
                return Response(
                    {
                        "message": f"Once the export is ready you will be able to download it"
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": f"Provider '{provider}' not found."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            capture_exception(e)
            return Response(
                {
                    "error": "Something went wrong please try again later",
                    "message": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    def get(self, request, slug):
        try:
            history = ExporterHistory.objects.filter(
                workspace__slug=slug
            ).select_related("workspace")

            if request.GET.get("per_page", False) and request.GET.get("cursor", False):
                return self.paginate(
                    request=request,
                    queryset=history,
                    on_results=lambda history: ExporterHistorySerializer(
                        history, many=True
                    ).data,
                )
            else:
                return Response(
                    {"error": "per_page and cursor are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            capture_exception(e)
            return Response(
                {"error": "Something went wrong please try again later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
