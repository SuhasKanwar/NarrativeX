import axios from "axios";
import { HTTP_SERVER_BASE_URL } from "./config";
import { getSession } from "next-auth/react";
import { pushToast } from "./toasts";

const httpClient = axios.create({
    baseURL: HTTP_SERVER_BASE_URL,
});

httpClient.interceptors.request.use(async (config) => {
    if (typeof window === "undefined") {
        return config;
    }

    const session = await getSession();
    const accessToken = session?.accessToken;

    if (accessToken) {
        config.headers = axios.AxiosHeaders.from(config.headers);
        config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
});

httpClient.interceptors.response.use(
    (response) => {
        if (typeof window !== "undefined") {
            const message = response.data?.message;
            pushToast("success", typeof message === "string" ? message : "Request completed.");
        }
        return response;
    },
    (error: unknown) => {
        if (typeof window !== "undefined" && !axios.isCancel(error)) {
            const responseMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
            const message = typeof responseMessage === "string"
                ? responseMessage
                : error instanceof Error ? error.message : "Request failed.";
            pushToast("error", message);
        }
        return Promise.reject(error);
    },
);

export default httpClient;
