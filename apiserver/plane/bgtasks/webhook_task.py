import requests
import uuid
import hashlib
import json
import hmac

# Django imports
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder

# Third party imports
from celery import shared_task
from sentry_sdk import capture_exception

from plane.db.models import (
    Webhook,
    WebhookLog,
    Project,
    Issue,
    Cycle,
    Module,
    ModuleIssue,
    CycleIssue,
    IssueComment,
)
from plane.api.serializers import (
    ProjectSerializer,
    IssueSerializer,
    CycleSerializer,
    ModuleSerializer,
    CycleIssueSerializer,
    ModuleIssueSerializer,
    IssueCommentSerializer,
)

SERIALIZER_MAPPER = {
    "project": ProjectSerializer,
    "issue": IssueSerializer,
    "cycle": CycleSerializer,
    "module": ModuleSerializer,
    "cycle_issue": CycleIssueSerializer,
    "module_issue": ModuleIssueSerializer,
    "issue_comment": IssueCommentSerializer,
}

MODEL_MAPPER = {
    "project": Project,
    "issue": Issue,
    "cycle": Cycle,
    "module": Module,
    "cycle_issue": CycleIssue,
    "module_issue": ModuleIssue,
    "issue_comment": IssueComment,
}


def get_model_data(event, event_id, many=False):
    model = MODEL_MAPPER.get(event)
    if many:
        queryset = model.objects.get(pk__in=event_id)
    else:
        queryset = model.objects.get(pk__in=event_id)

    serializer = SERIALIZER_MAPPER.get(event)
    data = serializer(queryset, many=many).data
    return data


@shared_task(
    bind=True,
    autoretry_for=(requests.RequestException,),
    retry_backoff=600,
    max_retries=5,
    retry_jitter=True,
)
def webhook_task(self, webhook, slug, event, event_id, action):
    try:
        webhook = Webhook.objects.get(id=webhook, workspace__slug=slug)

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Autopilot",
            "X-Plane-Delivery": str(uuid.uuid4()),
            "X-Plane-Event": event,
        }

        if action == "DELETE":
            event_data = {"id": str(event_id)}
        else:
            event_data = get_model_data(event=event, event_id=event_id, many=isinstance(event_id, list))

        # # Your secret key
        event_data = (
            json.loads(json.dumps(event_data, cls=DjangoJSONEncoder))
            if event_data is not None
            else None
        )

        # Use HMAC for generating signature
        if webhook.secret_key:
            event_data_json = json.dumps(event_data) if event_data is not None else '{}'
            hmac_signature = hmac.new(
                webhook.secret_key.encode("utf-8"),
                event_data_json.encode("utf-8"),
                hashlib.sha256
            )
            signature = hmac_signature.hexdigest()
            headers["X-Plane-Signature"] = signature

        action = {
            "POST": "create",
            "PATCH": "update",
            "PUT": "update",
            "DELETE": "delete",
        }.get(action, action)

        payload = {
            "event": event,
            "action": action,
            "webhook_id": str(webhook.id),
            "workspace_id": str(webhook.workspace_id),
            "data": event_data,
        }

        # Send the webhook event
        response = requests.post(
            webhook.url,
            headers=headers,
            json=payload,
            timeout=30,
        )

        # Log the webhook request
        WebhookLog.objects.create(
            workspace_id=str(webhook.workspace_id),
            webhook_id=str(webhook.id),
            event_type=str(event),
            request_method=str(action),
            request_headers=str(headers),
            request_body=str(payload),
            response_status=str(response.status_code),
            response_headers=str(response.headers),
            response_body=str(response.text),
            retry_count=str(self.request.retries),
        )

    except requests.RequestException as e:
        # Log the failed webhook request
        WebhookLog.objects.create(
            workspace_id=str(webhook.workspace_id),
            webhook_id=str(webhook.id),
            event_type=str(event),
            request_method=str(action),
            request_headers=str(headers),
            request_body=str(payload),
            response_status=500,
            response_headers="",
            response_body=str(e),
            retry_count=str(self.request.retries),
        )

        # Retry logic
        if self.request.retries >= self.max_retries:
            Webhook.objects.filter(pk=webhook.id).update(is_active=False)
            return
        raise requests.RequestException()

    except Exception as e:
        print(e)
        if settings.DEBUG:
            print(e)
        capture_exception(e)
        return


@shared_task()
def send_webhook(event, event_data, kw, action, slug, bulk):
    try:
        webhooks = Webhook.objects.filter(workspace__slug=slug, is_active=True)

        if event == "project":
            webhooks = webhooks.filter(project=True)

        if event == "issue":
            webhooks = webhooks.filter(issue=True)

        if event == "module" or event == "module_issue":
            webhooks = webhooks.filter(module=True)

        if event == "cycle" or event == "cycle_issue":
            webhooks = webhooks.filter(cycle=True)

        if event == "issue_comment":
            webhooks = webhooks.filter(issue_comment=True)

        
        if webhooks:
            
            if action in ["POST", "PATCH"]:
                if bulk:
                    event_id = []
                else:
                    event_id = event_data.get("id") if isinstance(event_data, dict) else None
            if action == "DELETE":
                event_id = kw.get("pk")


            for webhook in webhooks:
                webhook_task.delay(webhook.id, slug, event, event_id, action)

    except Exception as e:
        if settings.DEBUG:
            print(e)
        capture_exception(e)
        return
