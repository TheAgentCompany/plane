from .common import (
    ChangePasswordEndpoint,
    CSRFTokenEndpoint,
    ForgotPasswordEndpoint,
    ResetPasswordEndpoint,
    SetUserPasswordEndpoint,
    EmailCheckSignInEndpoint,
    EmailCheckSignUpEndpoint,
)
from .app.email import (
    SignInAuthEndpoint,
    SignUpAuthEndpoint,
)
from .app.github import (
    GitHubCallbackEndpoint,
    GitHubOauthInitiateEndpoint,
)
from .app.google import (
    GoogleCallbackEndpoint,
    GoogleOauthInitiateEndpoint,
)
from .app.magic import (
    MagicGenerateEndpoint,
    MagicSignInEndpoint,
    MagicSignUpEndpoint,
)

from .app.signout import SignOutAuthEndpoint


from .space.email import SignInAuthSpaceEndpoint, SignUpAuthSpaceEndpoint

from .space.github import (
    GitHubCallbackSpaceEndpoint,
    GitHubOauthInitiateSpaceEndpoint,
)

from .space.google import (
    GoogleCallbackSpaceEndpoint,
    GoogleOauthInitiateSpaceEndpoint,
)

from .space.magic import (
    MagicGenerateSpaceEndpoint,
    MagicSignInSpaceEndpoint,
    MagicSignUpSpaceEndpoint,
)

from .space.signout import SignOutAuthSpaceEndpoint
