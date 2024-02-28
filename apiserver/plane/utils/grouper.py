# Django imports
from django.db.models import Q, F
from django.contrib.postgres.aggregates import ArrayAgg
from django.contrib.postgres.fields import ArrayField
from django.db.models import Value, UUIDField
from django.db.models.functions import Coalesce

# Module imports
from plane.db.models import State, Label, ProjectMember, Cycle, Module


def resolve_keys(group_keys, value):
    """resolve keys to a key which will be used for
    grouping

    Args:
        group_keys (string): key which will be used for grouping
        value (obj): data value

    Returns:
        string: the key which will be used for
    """
    keys = group_keys.split(".")
    for key in keys:
        value = value.get(key, None)
    return value


def group_results(results_data, group_by, sub_group_by=False):
    """group results data into certain group_by

    Args:
        results_data (obj): complete results data
        group_by (key): string

    Returns:
        obj: grouped results
    """
    if sub_group_by:
        main_responsive_dict = dict()

        if sub_group_by == "priority":
            main_responsive_dict = {
                "urgent": {},
                "high": {},
                "medium": {},
                "low": {},
                "none": {},
            }

        for value in results_data:
            main_group_attribute = resolve_keys(sub_group_by, value)
            group_attribute = resolve_keys(group_by, value)
            if isinstance(main_group_attribute, list) and not isinstance(
                group_attribute, list
            ):
                if len(main_group_attribute):
                    for attrib in main_group_attribute:
                        if str(attrib) not in main_responsive_dict:
                            main_responsive_dict[str(attrib)] = {}
                        if (
                            str(group_attribute)
                            in main_responsive_dict[str(attrib)]
                        ):
                            main_responsive_dict[str(attrib)][
                                str(group_attribute)
                            ].append(value)
                        else:
                            main_responsive_dict[str(attrib)][
                                str(group_attribute)
                            ] = []
                            main_responsive_dict[str(attrib)][
                                str(group_attribute)
                            ].append(value)
                else:
                    if str(None) not in main_responsive_dict:
                        main_responsive_dict[str(None)] = {}

                    if str(group_attribute) in main_responsive_dict[str(None)]:
                        main_responsive_dict[str(None)][
                            str(group_attribute)
                        ].append(value)
                    else:
                        main_responsive_dict[str(None)][
                            str(group_attribute)
                        ] = []
                        main_responsive_dict[str(None)][
                            str(group_attribute)
                        ].append(value)

            elif isinstance(group_attribute, list) and not isinstance(
                main_group_attribute, list
            ):
                if str(main_group_attribute) not in main_responsive_dict:
                    main_responsive_dict[str(main_group_attribute)] = {}
                if len(group_attribute):
                    for attrib in group_attribute:
                        if (
                            str(attrib)
                            in main_responsive_dict[str(main_group_attribute)]
                        ):
                            main_responsive_dict[str(main_group_attribute)][
                                str(attrib)
                            ].append(value)
                        else:
                            main_responsive_dict[str(main_group_attribute)][
                                str(attrib)
                            ] = []
                            main_responsive_dict[str(main_group_attribute)][
                                str(attrib)
                            ].append(value)
                else:
                    if (
                        str(None)
                        in main_responsive_dict[str(main_group_attribute)]
                    ):
                        main_responsive_dict[str(main_group_attribute)][
                            str(None)
                        ].append(value)
                    else:
                        main_responsive_dict[str(main_group_attribute)][
                            str(None)
                        ] = []
                        main_responsive_dict[str(main_group_attribute)][
                            str(None)
                        ].append(value)

            elif isinstance(group_attribute, list) and isinstance(
                main_group_attribute, list
            ):
                if len(main_group_attribute):
                    for main_attrib in main_group_attribute:
                        if str(main_attrib) not in main_responsive_dict:
                            main_responsive_dict[str(main_attrib)] = {}
                        if len(group_attribute):
                            for attrib in group_attribute:
                                if (
                                    str(attrib)
                                    in main_responsive_dict[str(main_attrib)]
                                ):
                                    main_responsive_dict[str(main_attrib)][
                                        str(attrib)
                                    ].append(value)
                                else:
                                    main_responsive_dict[str(main_attrib)][
                                        str(attrib)
                                    ] = []
                                    main_responsive_dict[str(main_attrib)][
                                        str(attrib)
                                    ].append(value)
                        else:
                            if (
                                str(None)
                                in main_responsive_dict[str(main_attrib)]
                            ):
                                main_responsive_dict[str(main_attrib)][
                                    str(None)
                                ].append(value)
                            else:
                                main_responsive_dict[str(main_attrib)][
                                    str(None)
                                ] = []
                                main_responsive_dict[str(main_attrib)][
                                    str(None)
                                ].append(value)
                else:
                    if str(None) not in main_responsive_dict:
                        main_responsive_dict[str(None)] = {}
                    if len(group_attribute):
                        for attrib in group_attribute:
                            if str(attrib) in main_responsive_dict[str(None)]:
                                main_responsive_dict[str(None)][
                                    str(attrib)
                                ].append(value)
                            else:
                                main_responsive_dict[str(None)][
                                    str(attrib)
                                ] = []
                                main_responsive_dict[str(None)][
                                    str(attrib)
                                ].append(value)
                    else:
                        if str(None) in main_responsive_dict[str(None)]:
                            main_responsive_dict[str(None)][str(None)].append(
                                value
                            )
                        else:
                            main_responsive_dict[str(None)][str(None)] = []
                            main_responsive_dict[str(None)][str(None)].append(
                                value
                            )
            else:
                main_group_attribute = resolve_keys(sub_group_by, value)
                group_attribute = resolve_keys(group_by, value)

                if str(main_group_attribute) not in main_responsive_dict:
                    main_responsive_dict[str(main_group_attribute)] = {}

                if (
                    str(group_attribute)
                    in main_responsive_dict[str(main_group_attribute)]
                ):
                    main_responsive_dict[str(main_group_attribute)][
                        str(group_attribute)
                    ].append(value)
                else:
                    main_responsive_dict[str(main_group_attribute)][
                        str(group_attribute)
                    ] = []
                    main_responsive_dict[str(main_group_attribute)][
                        str(group_attribute)
                    ].append(value)

        return main_responsive_dict

    else:
        response_dict = {}

        if group_by == "priority":
            response_dict = {
                "urgent": [],
                "high": [],
                "medium": [],
                "low": [],
                "none": [],
            }

        for value in results_data:
            group_attribute = resolve_keys(group_by, value)
            if isinstance(group_attribute, list):
                if len(group_attribute):
                    for attrib in group_attribute:
                        if str(attrib) in response_dict:
                            response_dict[str(attrib)].append(value)
                        else:
                            response_dict[str(attrib)] = []
                            response_dict[str(attrib)].append(value)
                else:
                    if str(None) in response_dict:
                        response_dict[str(None)].append(value)
                    else:
                        response_dict[str(None)] = []
                        response_dict[str(None)].append(value)
            else:
                if str(group_attribute) in response_dict:
                    response_dict[str(group_attribute)].append(value)
                else:
                    response_dict[str(group_attribute)] = []
                    response_dict[str(group_attribute)].append(value)

        return response_dict


def issue_grouper(field, slug, project_id):
    if field == "state_id":
        return list(
            State.objects.filter(
                ~Q(name="Triage"),
                workspace__slug=slug,
                project_id=project_id,
            ).values_list("id", flat=True)
        )
    if field == "labels__id":
        return list(
            Label.objects.filter(
                workspace__slug=slug, project_id=project_id
            ).values_list("id", flat=True)
        )
    if field == "assignees__id":
        return list(
            ProjectMember.objects.filter(
                workspace__slug=slug, project_id=project_id
            ).values_list("member_id", flat=True)
        )
    if field == "priority":
        return ["urgent", "high", "medium", "low", "none"]

    if field == "created_by":
        return list(
            ProjectMember.objects.filter(
                workspace__slug=slug, project_id=project_id
            ).values_list("member_id", flat=True)
        )
    if field == "cycle_id":
        return list(
            Cycle.objects.filter(
                workspace__slug=slug, project_id=project_id
            ).values_list("id", flat=True)
        )
    if field == "modules__id":
        return list(
            Module.objects.filter(
                workspace__slug=slug, project_id=project_id
            ).values_list("id", flat=True)
        )


def issue_queryset_grouper(field, queryset):
    if field == "assignees__id":
        return queryset.annotate(
            label_ids=Coalesce(
                ArrayAgg(
                    "labels__id",
                    distinct=True,
                    filter=~Q(labels__id__isnull=True),
                ),
                Value([], output_field=ArrayField(UUIDField())),
            ),
            module_ids=Coalesce(
                ArrayAgg(
                    "issue_module__module_id",
                    distinct=True,
                    filter=~Q(issue_module__module_id__isnull=True),
                ),
                Value([], output_field=ArrayField(UUIDField())),
            ),
        )

    if field == "labels__id":
       return queryset.annotate(
            assignee_ids=Coalesce(
                ArrayAgg(
                    "assignees__id",
                    distinct=True,
                    filter=~Q(assignees__id__isnull=True),
                ),
                Value([], output_field=ArrayField(UUIDField())),
            ),
            module_ids=Coalesce(
                ArrayAgg(
                    "issue_module__module_id",
                    distinct=True,
                    filter=~Q(issue_module__module_id__isnull=True),
                ),
                Value([], output_field=ArrayField(UUIDField())),
            ),
        )
    
    if field == "modules__id":
        return queryset.annotate(modules__id=F("issue_module__module_id")).annotate(
            label_ids=Coalesce(
                ArrayAgg(
                    "labels__id",
                    distinct=True,
                    filter=~Q(labels__id__isnull=True),
                ),
                Value([], output_field=ArrayField(UUIDField())),
            ),
            assignee_ids=Coalesce(
                ArrayAgg(
                    "assignees__id",
                    distinct=True,
                    filter=~Q(assignees__id__isnull=True),
                ),
                Value([], output_field=ArrayField(UUIDField())),
            ),
        )
    return queryset