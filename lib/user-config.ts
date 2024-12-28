export interface UserConfig {
  name: string;
  redditViewId: string;
  igViewId: string;
  doneFieldIG: string;
  doneFieldReddit: string;
  uploadFieldIG: string;
  uploadFieldReddit: string;
}

export const userConfigs: Record<string, UserConfig> = {
  "janota.d@gmail.com": {
    name: "Meli",
    redditViewId: "viwe30kukWSBattHl",
    igViewId: "viw7JbVroNNLqviTl",
    doneFieldIG: "Done Meli",
    doneFieldReddit: "Done Meli",
    uploadFieldIG: "Upload Content Meli",
    uploadFieldReddit: "Upload Content Meli"
  },
  "pragerkar@gmail.com": {
    name: "Palina",
    redditViewId: "viwlEQGwnopB0Hm9Y",
    igViewId: "viwa3aWC8CXJxfuaa",
    doneFieldIG: "Done",
    doneFieldReddit: "Done Paline",
    uploadFieldIG: "Upload Content",
    uploadFieldReddit: "Upload Content Palina"
  }
}; 