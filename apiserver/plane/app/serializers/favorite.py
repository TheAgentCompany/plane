from rest_framework import serializers

from plane.db.models import (
    UserFavorite,
    Cycle,
    Module,
    Issue,
    IssueView,
    Page,
    Project,
)


class ProjectFavoriteLiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "logo_props",
        ]


class PageFavoriteLiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Page
        fields = [
            "id",
            "name",
            "logo_props",
        ]


class CycleFavoriteLiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cycle
        fields = [
            "id",
            "name",
            "logo_props",
        ]


class ModuleFavoriteLiteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = [
            "id",
            "name",
            "logo_props",
        ]


class ViewFavoriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = IssueView
        fields = ["id", "name", "logo_props"]


def get_entity_model_and_serializer(entity_type):
    entity_map = {
        "cycle": (Cycle, CycleFavoriteLiteSerializer),
        "issue": (Issue, None),
        "module": (Module, ModuleFavoriteLiteSerializer),
        "view": (IssueView, ViewFavoriteSerializer),
        "page": (Page, PageFavoriteLiteSerializer),
        "project": (Project, ProjectFavoriteLiteSerializer),
        "folder": (None, None),
    }
    return entity_map.get(entity_type, (None, None))


class UserFavoriteSerializer(serializers.ModelSerializer):
    entity_data = serializers.SerializerMethodField()

    class Meta:
        model = UserFavorite
        fields = [
            "id",
            "entity_type",
            "entity_identifier",
            "entity_data",
            "name",
            "is_folder",
            "sequence",
            "parent",
            "workspace",
        ]
        read_only_fields = ["workspace", "created_by", "updated_by"]

    def get_entity_data(self, obj):
        entity_type = obj.entity_type
        entity_identifier = obj.entity_identifier

        entity_model, entity_serializer = get_entity_model_and_serializer(
            entity_type
        )
        if entity_model and entity_serializer:
            try:
                entity = entity_model.objects.get(pk=entity_identifier)
                return entity_serializer(entity).data
            except entity_model.DoesNotExist:
                return None
        return None
