# Third party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer

from plane.db.models import IssueView, IssueViewFavorite
from plane.utils.issue_filters import issue_filters


class IssueViewSerializer(BaseSerializer):
    is_favorite = serializers.BooleanField(read_only=True)

    class Meta:
        model = IssueView
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "project",
            "query",
        ]

    def create(self, validated_data):
        query_params = validated_data.pop("query_data", {})

        if not bool(query_params):
            raise serializers.ValidationError(
                {"query_data": ["Query data field cannot be empty"]}
            )

        validated_data["query"] = issue_filters(query_params, "POST")
        return IssueView.objects.create(**validated_data)

    def update(self, instance, validated_data):
        query_params = validated_data.pop("query_data", {})
        if not bool(query_params):
            raise serializers.ValidationError(
                {"query_data": ["Query data field cannot be empty"]}
            )

        validated_data["query"] = issue_filters(query_params, "PATCH")
        return super().update(instance, validated_data)


class IssueViewFavoriteSerializer(BaseSerializer):
    view_detail = IssueViewSerializer(source="issue_view", read_only=True)

    class Meta:
        model = IssueViewFavorite
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "project",
            "user",
        ]
