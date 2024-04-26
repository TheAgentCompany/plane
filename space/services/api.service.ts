import axios from "axios";
import Cookies from "js-cookie";

abstract class APIService {
  protected baseURL: string;
  protected headers: any = {};

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setCSRFToken(token: string) {
    Cookies.set("csrf_token", token, { expires: 30 });
  }

  getCSRFToken() {
    return Cookies.get("csrf_token");
  }

  setRefreshToken(token: string) {
    Cookies.set("refresh_token", token, { expires: 30 });
  }

  getRefreshToken() {
    return Cookies.get("refresh_token");
  }

  purgeRefreshToken() {
    Cookies.remove("refresh_token", { path: "/" });
  }

  setAccessToken(token: string) {
    Cookies.set("access_token", token, { expires: 30 });
  }

  getAccessToken() {
    return Cookies.get("access_token");
  }

  purgeAccessToken() {
    Cookies.remove("access_token", { path: "/" });
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.getAccessToken()}`,
    };
  }

  get(url: string, config = {}): Promise<any> {
    return axios({
      method: "get",
      url: this.baseURL + url,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
      withCredentials: true,
    });
  }

  post(url: string, data = {}, config = {}): Promise<any> {
    return axios({
      method: "post",
      url: this.baseURL + url,
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
      withCredentials: true,
    });
  }

  put(url: string, data = {}, config = {}): Promise<any> {
    return axios({
      method: "put",
      url: this.baseURL + url,
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
      withCredentials: true,
    });
  }

  patch(url: string, data = {}, config = {}): Promise<any> {
    return axios({
      method: "patch",
      url: this.baseURL + url,
      data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
      withCredentials: true,
    });
  }

  delete(url: string, data?: any, config = {}): Promise<any> {
    return axios({
      method: "delete",
      url: this.baseURL + url,
      data: data,
      headers: this.getAccessToken() ? this.getHeaders() : {},
      ...config,
      withCredentials: true,
    });
  }

  request(config = {}) {
    return axios(config);
  }
}

export default APIService;
