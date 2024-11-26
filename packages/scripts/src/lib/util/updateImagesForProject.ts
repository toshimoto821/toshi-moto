import axios from "axios";

interface IUpdateImagesForProjectOpts {
  find: {
    commitSha: string;
  };
  update: {
    commitSha: string;
    tags: string[];
  };
}

export const updateImagesForProject = async (
  projectId: string,
  opts: IUpdateImagesForProjectOpts
) => {
  const { find, update } = opts;
  

  const response = await axios.post(`https://api.webshotarchive.com/api/images/${projectId}/update-images`, {
    find,
    update,
  });
  if (response.status !== 200) {
    console.log(response.data);
    throw new Error(`Failed to update images for project ${projectId}`);
  }

  return response.data;
};
