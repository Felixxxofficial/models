type UserConfig = {
  airtableView: string;
  name: string;
}

export const userConfigs: { [email: string]: UserConfig } = {
  'janota.d@gmail.com': {
    airtableView: 'viw7JbVroNNLqviTl', // Meli's view
    name: 'Meli'
  },
  'client2@gmail.com': {
    airtableView: 'viewXXXXXXXXX', // Client2's view
    name: 'Client2'
  }
  // Add any other emails you want to allow login for
} 