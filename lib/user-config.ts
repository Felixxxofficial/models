export interface UserConfig {
  name: string;
  redditViewId: string;
  igViewId: string;
  doneFieldIG: string;
  doneFieldReddit: string;
  uploadFieldIG: string;
  uploadFieldReddit: string;
}

const devConfigs: Record<string, UserConfig> = {
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
    doneFieldReddit: "Done Palina",
    uploadFieldIG: "Upload Content",
    uploadFieldReddit: "Upload Content Palina"
  }
};

const prodConfigs: Record<string, UserConfig> = {
  "melinasiniawsky@gmail.com": {
    name: "Meli",
    redditViewId: "viwe30kukWSBattHl",
    igViewId: "viw7JbVroNNLqviTl",
    doneFieldIG: "Done Meli",
    doneFieldReddit: "Done Meli",
    uploadFieldIG: "Upload Content Meli",
    uploadFieldReddit: "Upload Content Meli"
  },
  "pbaranova13@gmail.com": {
    name: "Palina",
    redditViewId: "viwlEQGwnopB0Hm9Y",
    igViewId: "viwa3aWC8CXJxfuaa",
    doneFieldIG: "Done",
    doneFieldReddit: "Done Palina",
    uploadFieldIG: "Upload Content",
    uploadFieldReddit: "Upload Content Palina"
  }
};

// Add this before the export
const isProduction = process.env.NODE_ENV === 'production';
console.log('Environment:', process.env.NODE_ENV);
console.log('Using config for:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

// TESTING ONLY - Force production config
const forceProd = false; // Changed from true to false to use development config
export const userConfigs = forceProd ? prodConfigs : devConfigs;

// Comment out the real export while testing
// export const userConfigs = isProduction ? prodConfigs : devConfigs; 