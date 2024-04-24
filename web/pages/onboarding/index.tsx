import { ReactElement, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import useSWR from "swr";
// types
import { TOnboardingSteps, TUserProfile } from "@plane/types";
// ui
import { Spinner } from "@plane/ui";
// components
import { PageHead } from "@/components/core";
import { InviteMembers, CreateOrJoinWorkspaces, ProfileSetup } from "@/components/onboarding";
// hooks
import { USER_ONBOARDING_COMPLETED } from "@/constants/event-tracker";
import { useUser, useWorkspace, useUserProfile, useEventTracker } from "@/hooks/store";
import useUserAuth from "@/hooks/use-user-auth";
// layouts
import { UserAuthWrapper } from "@/layouts/auth-layout";
import DefaultLayout from "@/layouts/default-layout";
// lib types
import { NextPageWithLayout } from "@/lib/types";
// services
import { WorkspaceService } from "@/services/workspace.service";

export enum EOnboardingSteps {
  PROFILE_SETUP = "PROFILE_SETUP",
  WORKSPACE_CREATE_OR_JOIN = "WORKSPACE_CREATE_OR_JOIN",
  WORKSPACE_INVITE = "WORKSPACE_INVITE",
}

const workspaceService = new WorkspaceService();

const OnboardingPage: NextPageWithLayout = observer(() => {
  // states
  const [step, setStep] = useState<EOnboardingSteps | null>(null);
  const [totalSteps, setTotalSteps] = useState<number | null>(null);
  // router
  const router = useRouter();
  // store hooks
  const { captureEvent } = useEventTracker();
  const { data: user, isLoading: currentUserLoader, updateCurrentUser } = useUser();
  const { data: profile, updateUserOnBoard, updateUserProfile } = useUserProfile();
  const { workspaces, fetchWorkspaces } = useWorkspace();
  // custom hooks
  const {} = useUserAuth({
    routeAuth: "onboarding",
    user: user || null,
    userProfile: profile,
    isLoading: currentUserLoader,
  });
  // computed values
  const workspacesList = Object.values(workspaces ?? {});
  // fetching workspaces list
  useSWR(`USER_WORKSPACES_LIST`, () => fetchWorkspaces(), {
    shouldRetryOnError: false,
  });
  // fetching user workspace invitations
  const { data: invitations } = useSWR("USER_WORKSPACE_INVITATIONS_LIST", () =>
    workspaceService.userWorkspaceInvitations()
  );
  // handle step change
  const stepChange = async (steps: Partial<TOnboardingSteps>) => {
    if (!user) return;

    const payload: Partial<TUserProfile> = {
      onboarding_step: {
        ...profile.onboarding_step,
        ...steps,
      },
    };

    await updateUserProfile(payload);
  };
  // complete onboarding
  const finishOnboarding = async () => {
    if (!user || !workspacesList) return;

    await updateUserOnBoard()
      .then(() => {
        captureEvent(USER_ONBOARDING_COMPLETED, {
          // user_role: user.role,
          email: user.email,
          user_id: user.id,
          status: "SUCCESS",
        });
      })
      .catch(() => {
        console.log("Failed to update onboarding status");
      });

    router.replace(`/${workspacesList[0]?.slug}`);
  };

  useEffect(() => {
    if (workspacesList && workspacesList?.length > 0) setTotalSteps(1);
    else setTotalSteps(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleStepChange = async () => {
      if (!user) return;

      const onboardingStep = profile.onboarding_step;

      if (!onboardingStep.profile_complete) setStep(EOnboardingSteps.PROFILE_SETUP);

      if (
        !onboardingStep.workspace_join &&
        !onboardingStep.workspace_create &&
        workspacesList &&
        workspacesList?.length > 0
      ) {
        await updateUserProfile({
          onboarding_step: {
            ...profile.onboarding_step,
            workspace_join: true,
            workspace_create: true,
          },
          last_workspace_id: workspacesList[0]?.id,
        });
        return;
      }

      // For Invited Users, they will skip all other steps.
      if (totalSteps && totalSteps === 1) return;

      if (onboardingStep.profile_complete && !(onboardingStep.workspace_join || onboardingStep.workspace_create)) {
        setStep(EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN);
      }

      if (
        onboardingStep.profile_complete &&
        (onboardingStep.workspace_join || onboardingStep.workspace_create) &&
        !onboardingStep.workspace_invite
      )
        setStep(EOnboardingSteps.WORKSPACE_INVITE);
    };

    handleStepChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, step, updateCurrentUser, workspacesList]);

  return (
    <>
      <PageHead title="Onboarding" />
      {user && totalSteps && step !== null ? (
        <div className={`flex h-full w-full flex-col`}>
          {step === EOnboardingSteps.PROFILE_SETUP ? (
            <ProfileSetup
              user={user}
              totalSteps={totalSteps}
              stepChange={stepChange}
              finishOnboarding={finishOnboarding}
            />
          ) : step === EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN && invitations ? (
            <CreateOrJoinWorkspaces invitations={invitations} totalSteps={totalSteps} stepChange={stepChange} />
          ) : step === EOnboardingSteps.WORKSPACE_INVITE ? (
            <InviteMembers
              finishOnboarding={finishOnboarding}
              totalSteps={totalSteps}
              stepChange={stepChange}
              user={user}
              workspace={workspacesList?.[0]}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              Something Went wrong. Please try again.
            </div>
          )}
        </div>
      ) : (
        <div className="grid h-screen w-full place-items-center">
          <Spinner />
        </div>
      )}
    </>
  );
});

OnboardingPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <UserAuthWrapper>
      <DefaultLayout>{page}</DefaultLayout>
    </UserAuthWrapper>
  );
};

export default OnboardingPage;
