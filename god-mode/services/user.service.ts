// services
import { APIService } from "services/api.service";
// types
import type { IUser, IInstanceAdminStatus } from "@plane/types";
// helpers
import { API_BASE_URL } from "helpers/common.helper";

export class UserService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async currentUser(): Promise<IUser> {
    return this.get("/api/users/me/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async currentUserInstanceAdminStatus(): Promise<IInstanceAdminStatus> {
    return this.get("/api/users/me/instance-admin/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
}
