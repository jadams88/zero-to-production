export interface IGuide {
  label: string;
  guide: string;
  path: string;
  description: string;
}

export const GUIDES: IGuide[] = [
  {
    label: 'Getting Started',
    guide: 'GETTING_STARTED',
    path: 'getting-started',
    description: 'start your own monorepo',
  },
  {
    label: 'Serverless with AWS Lambda',
    guide: 'LAMBDA_FUNCTIONS',
    path: 'aws-lambda',
    description: 'deploy a serverless API on AWS Lambda',
  },
  {
    label: 'Firebase Hosting',
    guide: 'FIREBASE_HOSTING',
    path: 'firebase-hosting',
    description: 'deploy an Angular application on Firebase Hosting',
  },
  {
    label: 'SSR & Firebase Functions',
    guide: 'FIREBASE_SSR',
    path: 'ssr-firebase-functions',
    description:
      'deploy an Angular Universal application on Firebase Functions',
  },
  {
    label: 'Google Cloud Kubernetes',
    guide: 'GOOGLE_CLOUD',
    path: 'google-cloud-k8s',
    description: 'deploy an API on Google Cloud Kubernetes',
  },
];
