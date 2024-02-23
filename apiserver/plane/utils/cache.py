from django.core.cache import cache
from django.utils.encoding import force_bytes
import hashlib
from functools import wraps
from rest_framework.response import Response


def generate_cache_key(custom_path, auth_header=None):
    """Generate a cache key with the given params"""
    if auth_header:
        key_data = f"{custom_path}:{auth_header}"
    else:
        key_data = custom_path
    return hashlib.md5(force_bytes(key_data)).hexdigest()


def cache_response(timeout=60 * 60, path=None):
    """decorator to create cache per user"""

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(instance, request, *args, **kwargs):
            # Function to generate cache key
            auth_header = (
                None if request.user.is_anonymous else str(request.user.id)
            )
            custom_path = path if path is not None else request.get_full_path()
            key = generate_cache_key(custom_path, auth_header)
            cached_result = cache.get(key)
            if cached_result is not None:
                print("Cache Hit")
                return Response(
                    cached_result["data"], status=cached_result["status"]
                )

            print("Cache Miss")
            response = view_func(instance, request, *args, **kwargs)

            if response.status_code == 200:
                cache.set(
                    key,
                    {"data": response.data, "status": response.status_code},
                    timeout,
                )

            return response

        return _wrapped_view

    return decorator


def invalidate_cache(path=None, url_params=False):
    """invalidate cache per user"""

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(instance, request, *args, **kwargs):
            # Invalidate cache before executing the view function
            if url_params:
                path_with_values = path
                for key, value in kwargs.items():
                    path_with_values = path_with_values.replace(
                        f":{key}", str(value)
                    )

                custom_path = path_with_values
            else:
                custom_path = (
                    path if path is not None else request.get_full_path()
                )

            auth_header = (
                None if request.user.is_anonymous else str(request.user.id)
            )
            key = generate_cache_key(custom_path, auth_header)
            cache.delete(key)
            print("Invalidating cache")
            # Execute the view function
            return view_func(instance, request, *args, **kwargs)

        return _wrapped_view

    return decorator
