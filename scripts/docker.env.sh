#!/bin/bash

set -o nounset

cat <<EOF
PLANE_SECRET_KEY=
DATABASE_URL=
REDIS_URL=
PLANE_EMAIL_HOST=
PLANE_EMAIL_HOST_USER=
PLANE_EMAIL_HOST_PASSWORD=

PLANE_AWS_REGION=
PLANE_AWS_ACCESS_KEY_ID=
PLANE_AWS_SECRET_ACCESS_KEY=
PLANE_AWS_S3_BUCKET_NAME=


PLANE_SENTRY_DSN=
PLANE_WEB_URL=

DISABLE_COLLECTSTATIC=1

PLANE_GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_GITHUB_ID=
NEXT_PUBLIC_GOOGLE_CLIENTID=
NEXT_PUBLIC_API_BASE_URL=

EOF