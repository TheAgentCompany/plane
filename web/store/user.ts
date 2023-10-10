// mobx
import { action, observable, computed, runInAction, makeObservable } from "mobx";
// services
import { UserService } from "services/user.service";
// interfaces
import { ICurrentUser, ICurrentUserSettings } from "types/users";

interface IUserStore {
  loader: boolean;
  currentUser: ICurrentUser | null;
  currentUserSettings: ICurrentUserSettings | null;
  fetchCurrentUser: () => Promise<ICurrentUser>;
}

class UserStore implements IUserStore {
  loader: boolean = false;
  currentUser: ICurrentUser | null = null;
  currentUserSettings: ICurrentUserSettings | null = null;
  // root store
  rootStore;
  // services
  userService;

  constructor(_rootStore: any) {
    makeObservable(this, {
      // observable
      loader: observable.ref,
      currentUser: observable.ref,
      currentUserSettings: observable.ref,
      // action
      fetchCurrentUser: action,
      // computed
    });
    this.rootStore = _rootStore;
    this.userService = new UserService();
  }

  fetchCurrentUser = async () => {
    try {
      const response = await this.userService.currentUser();
      console.log("response", response);
      if (response) {
        runInAction(() => {
          this.currentUser = response;
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  // setCurrentUser = async () => {
  //   try {
  //     let userResponse: ICurrentUser | null = await UserService.currentUser();
  //     userResponse = userResponse || null;

  //     if (userResponse) {
  //       const userPayload: ICurrentUser = {
  //         id: userResponse?.id,
  //         avatar: userResponse?.avatar,
  //         first_name: userResponse?.first_name,
  //         last_name: userResponse?.last_name,
  //         username: userResponse?.username,
  //         email: userResponse?.email,
  //         mobile_number: userResponse?.mobile_number,
  //         is_email_verified: userResponse?.is_email_verified,
  //         is_tour_completed: userResponse?.is_tour_completed,
  //         onboarding_step: userResponse?.onboarding_step,
  //         is_onboarded: userResponse?.is_onboarded,
  //         role: userResponse?.role,
  //       };
  //       runInAction(() => {
  //         this.currentUser = userPayload;
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Fetching current user error", error);
  //   }
  // };

  // setCurrentUserSettings = async () => {
  //   try {
  //     let userSettingsResponse: ICurrentUserSettings | null = await UserService.currentUser();
  //     userSettingsResponse = userSettingsResponse || null;

  //     if (userSettingsResponse) {
  //       const themePayload = {
  //         theme: { ...userSettingsResponse?.theme },
  //       };
  //       runInAction(() => {
  //         this.currentUserSettings = themePayload;
  //         this.rootStore.theme.setTheme(themePayload);
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Fetching current user error", error);
  //   }
  // };

  // updateCurrentUser = async (user: ICurrentUser) => {
  //   try {
  //     let userResponse: ICurrentUser = await UserService.updateUser(user);
  //     userResponse = userResponse || null;

  //     if (userResponse) {
  //       const userPayload: ICurrentUser = {
  //         id: userResponse?.id,
  //         avatar: userResponse?.avatar,
  //         first_name: userResponse?.first_name,
  //         last_name: userResponse?.last_name,
  //         username: userResponse?.username,
  //         email: userResponse?.email,
  //         mobile_number: userResponse?.mobile_number,
  //         is_email_verified: userResponse?.is_email_verified,
  //         is_tour_completed: userResponse?.is_tour_completed,
  //         onboarding_step: userResponse?.onboarding_step,
  //         is_onboarded: userResponse?.is_onboarded,
  //         role: userResponse?.role,
  //       };
  //       runInAction(() => {
  //         this.currentUser = userPayload;
  //       });
  //       return userPayload;
  //     }
  //   } catch (error) {
  //     console.error("Updating user error", error);
  //     return error;
  //   }
  // };

  // updateCurrentUserSettings = async (userTheme: ICurrentUserSettings) => {
  //   try {
  //     let userSettingsResponse: ICurrentUserSettings = await UserService.updateUser(userTheme);
  //     userSettingsResponse = userSettingsResponse || null;
  //     if (userSettingsResponse) {
  //       const themePayload = {
  //         theme: { ...userSettingsResponse?.theme },
  //       };
  //       runInAction(() => {
  //         this.currentUserSettings = themePayload;
  //         this.rootStore.theme.setTheme(themePayload);
  //       });
  //       return themePayload;
  //     }
  //   } catch (error) {
  //     console.error("Updating user settings error", error);
  //     return error;
  //   }
  // };

  // init load
  initialLoad() {}
}

export default UserStore;
