import { action, makeObservable, observable, runInAction } from "mobx";
// types
import { IUser, IUserAccount } from "@plane/types";
// services
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
// stores
import { RootStore } from "@/store/root.store";
import { IAccountStore, AccountStore } from "@/store/user/account.store";
import { ProfileStore, IProfileStore } from "@/store/user/profile.store";
import { IUserMembershipStore, UserMembershipStore } from "@/store/user/user-membership.store";
import { API_BASE_URL } from "@/helpers/common.helper";
import { IUserSettingsStore, UserSettingsStore } from "./user-setting.store";

export interface IUserStore {
  // observables
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any | undefined;
  // model observables
  data: IUser | undefined;
  currentUserSettings: IUserSettingsStore;
  profile: IProfileStore;
  accounts: Record<string, IAccountStore>;
  membership: IUserMembershipStore;
  // actions
  fetchCurrentUser: () => Promise<IUser>;
  updateCurrentUser: (data: Partial<IUser>) => Promise<IUser>;
  fetchUserAccounts: () => Promise<void>;
  deactivateAccount: () => Promise<void>;
  signOut: () => Promise<void>;
}

export class UserStore implements IUserStore {
  // observables flags
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  error: any | undefined = undefined;
  data: IUser | undefined = undefined;
  // model observables
  avatar: string | undefined = undefined;
  cover_image: string | null = null;
  date_joined: string | undefined = undefined;
  display_name: string | undefined = undefined;
  email: string | undefined = undefined;
  first_name: string | undefined = undefined;
  id: string | undefined = undefined;
  is_active: boolean = false;
  is_bot: boolean = false;
  is_email_verified: boolean = false;
  is_password_autoset: boolean = false;
  last_name: string | undefined = undefined;
  username: string | undefined = undefined;
  user_timezone: string | undefined = undefined;
  // relational observables
  profile: IProfileStore;
  currentUserSettings: IUserSettingsStore;
  accounts: Record<string, IAccountStore> = {};
  membership: IUserMembershipStore;
  // service
  userService: UserService;
  authService: AuthService;
  // root store
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    // stores
    this.rootStore = rootStore;
    this.profile = new ProfileStore();
    this.currentUserSettings = new UserSettingsStore();
    this.membership = new UserMembershipStore(rootStore);
    // service
    this.userService = new UserService();
    this.authService = new AuthService();
    // observables
    makeObservable(this, {
      // observables
      isAuthenticated: observable.ref,
      isLoading: observable.ref,
      error: observable,
      // model observables
      data: observable,
      profile: observable,
      currentUserSettings: observable,
      accounts: observable,
      membership: observable,
      // actions
      fetchCurrentUser: action,
      fetchUserAccounts: action,
    });
  }

  /**
   * Fetches the current user
   * @returns Promise<IUser>
   */
  fetchCurrentUser = async () => {
    try {
      runInAction(() => {
        this.isLoading = true;
      });
      const user = await this.userService.currentUser();
      runInAction(() => {
        this.data = user;
        this.isLoading = false;
        this.isAuthenticated = true;
      });
      return user;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.isAuthenticated = false;
        this.error = error;
      });
      throw error;
    }
  };

  /**
   * Updates the current user
   * @param data
   * @returns Promise<IUser>
   */
  updateCurrentUser = async (data: Partial<IUser>) => {
    try {
      const user = await this.userService.updateUser(data);
      runInAction(() => {
        this.data = user;
      });
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Deactivates the current user
   * @returns Promise<void>
   */
  deactivateAccount = async () => {
    await this.userService.deactivateAccount();
    this.rootStore.resetOnSignout();
  };

  /**
   * Signs out the current user
   * @returns Promise<void>
   */
  signOut = async () => {
    await this.authService.signOut(API_BASE_URL);
    this.rootStore.resetOnSignout();
  };

  /**
   * Fetches the user accounts
   */
  fetchUserAccounts = async () => {
    const userAccounts = await this.userService.getCurrentUserAccounts();
    runInAction(() => {
      userAccounts.forEach((account: IUserAccount) => {
        this.accounts[account.provider_account_id] = new AccountStore(this.rootStore, account);
      });
    });
  };
}
