import axios from "axios";
import { HTTP_SERVER_BASE_URL } from "./config";
import { getSession } from "next-auth/react";

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