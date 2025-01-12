import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  },
  Storage: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
    identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
  }
});