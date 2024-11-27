import axios from "axios";
import * as core from "@actions/core";
interface IUpdateImagesForProjectOpts {
  find: {
    commitSha: string;
  };
  update: {
    commitSha: string;
    tags: string[];
  };
}

interface IUpdateImagesForProjectAuth {
  clientId: string;
  clientSecret: string;
}

export const updateImagesForProject = async (
  projectId: string,
  opts: IUpdateImagesForProjectOpts,
  auth?: IUpdateImagesForProjectAuth
) => {
  const { find, update } = opts;
  
  const headers = {} as Record<string, string>;

  if (auth) {
    headers["x-client-id"] = auth.clientId;
    headers["x-client-secret"] = auth.clientSecret;
  }

  const response = await axios.post(`https://api.webshotarchive.com/api/image/update/${projectId}/update-images`, {
    find,
    update,
    },
    {
      headers,
    }
  );
  if (response.status >= 400) {
    core.debug(response.data);
    throw new Error(`Failed to update images for project ${projectId}`);
  }

  return response.data;
};
