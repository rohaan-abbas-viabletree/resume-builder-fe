// import { USER_KEY, getParsedObject } from "@/app/lib/utils/utils";

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"],
): (() => Promise<TData>) => {
  // const resalUser = Cookies.get(USER_KEY);
  // const resalUserParsed = getParsedObject(resalUser ?? "");
  const url = (process.env.NEXT_PUBLIC_BASE_URL as string) + "/graphql";
  return async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ...(resalUserParsed?.access_token
        //   ? {
        //       Authorization: `Bearer ${resalUserParsed?.access_token}`,
        //     }
        //   : {}),
        ...options,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message: errorMessage, path } =
        json.errors[0]?.extensions?.error?.details?.errors?.[0] || {};
      const msg =
        path?.length && errorMessage
          ? path?.[0] + " " + errorMessage
          : errorMessage;
      throw {
        field: path?.[0],
        message: errorMessage,
        error: new Error(msg),
      };
    }
    if (res?.status === 401) {
      // Cookies.remove(USER_KEY);
      // window.location.href = "/login";
      return;
    }

    return json.data;
  };
};
