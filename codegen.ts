import dotenv from "dotenv";
import { IGraphQLConfig } from "graphql-config";

dotenv.config({
  debug: true,
  path: ".env.local",
});

const config: IGraphQLConfig = {
  schema: process.env.NEXT_PUBLIC_BASE_URL + "/graphql",
  documents: ["src/graphql/**/*.gql"],
  extensions: {
    codegen: {
      debug: true,
      verbose: true,
      ignoreNoDocuments: true,
      overwrite: true,
      generates: {
        "src/app/client-types.ts": {
          plugins: ["typescript"],
        },
        "./src/app/api/": {
          preset: "near-operation-file",
          presetConfig: {
            baseTypesPath: "~@/app/client-types",
          },
          plugins: [
            "typescript-operations",
            "typescript-react-query",
            {
              add: {
                content: "/* eslint-disable */\n",
              },
            },
          ],
          config: {
            fetcher: {
              func: "@/app/api/mutator/fetcherGraphql#fetchData",
              isReactHook: false,
            },
            legacyMode: true,
            exposeFetcher: true,
            exposeDocument: true,
            exposeQueryKeys: true,
            exposeMutationKeys: true,
            addInfiniteQuery: true,
            errorType: "any",
          },
        },
      },
    },
  },
};

export default config;
