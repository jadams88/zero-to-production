### Deploy your API on Google Cloud Kubernetes

Ensure you have completed all the [prerequisites].

All files related to deploying to Google Cloud Kubernetes are located in the `dev-ops/` directory.

**WARNING**: This guide is in no way a comprehensive guide to deploying your application in Kubernetes, rather a starting point for you to test and get your feet wet with deploying your containers to the cloud. This example deploys the single node API with [traefik] as a reveres proxy, an architect that may not warrant the complexity. That being said, the kubernetes resource configurations should give you an idea of how to add additional services and deployments to you cluster e.g. separate the Authentication module to it's own server.

#### Contents

- [Create the initial API docker image](#google-cloud-build-trigger---initial-image)
- [Deploy on Google Cloud Kubernetes Engine](#google-cloud---kubernetes-engine)
- [Auto build and trigger rolling updates with semantic releases](#google-cloud-build-trigger---trigger-update)

#### Google Cloud Build Trigger - Initial Image

Rather than build and push our container to the cloud registry, Google Cloud offers a Cloud Build service to build your images from source. A `Dockerfile` to build our API project from the source files is provided at `docker/server.Dockerfile`. Please see the [Docker README] for further details.

1. On Google Cloud, navigate to **Tools > Cloud Build**.
2. Follow the steps to connect you **`Git`** repo.
3. Once your repo is authenticated create a _Push Trigger_ by following the wizard.

   - For the initial build select `Push to a branch` and enter the `master` branch.

   - When selecting the `Build Configuration` select the `Cloud Build Configuration File` option and point it at `/dev-ops/cloudbuild.initial.yaml`

   - The build file is set up to use _substitutions_ for the image name and the source directory of the project. The **\_PROJECT_NAME** and **\_PROJECT_DIRECTORY** variables must be set and the project directory is relative to the `apps/` directory.

   For this example site:

   - **\_PROJECT_NAME**: `server-api`
   - **\_PROJECT_DIRECTORY**: `server/api`

4. Manually trigger the build and create you initial API image. Check that the build completed and that your image is visible in the **Container Registry** once complete.

5. Disable the build trigger once complete.

#### Google Cloud - Kubernetes Engine

Follow the next steps to deploy you production container. A pre-configured set of Kubernetes deployment `.yaml` files are located in `/dev-ops/kubernetes/`.

1. Reserve a Static IP address to allow the load balancer to auto create global forwarding rules. **VPC Network > External IP Address > Reserve Static IP**.
2. Create a new Kubernetes Cluster, **Kuberetes Engine > Clusters > Create Cluster** and follow the guides as necessary. For testing select the preset 'My first cluster'. Once up and running connect to your cluster from your terminal.
3. Once connected, the first step is to apply all configuration and secrets to the cluster that your containers may require. For this setup all required setup files are located in the `dev-ops/config/` directory.

   - **No changes required**: `config.yaml` - Contains non sensitive information and is a `ConfigMap` resource.
   - **Changes required**: `secrets.yaml` - A `Secret` resource that contains all sensitive information. All values here must be base64 encoded strings. Rename `example.secrets.yaml` to `secrets.yaml` and Replace the PLACEHOLDER entries with your respective encoded strings. **DO NOT COMMIT THIS INTO SOURCE CONTROL**.
   - **No changes required**: `server-middleware.yaml` - a `BackendConfig` resource to change the default timeout for all connections. This is required for WebSocket connections, with a possible maximum time of 24 hours.
   - **Changes required**: `gcl-managed-certificate.yaml` - configures a [Google Managed Certificate] for SSL/TLS for your domain.
     - Name of the **managed certificate resource**
     - The associated certificate **domain name**
   - **No changes required**: `traefik-cluster-role.yaml` - Role-based access control for [Traefik], the reverse proxy sitting between the Google Cloud L7 global load balancer and your application containers.
   - **No changes required**: `traefik-config.yaml` is the `.toml` configuration for Traefik.

   Apply all configuration specs by running:

   ```bash
   kubectl apply -f dev-ops/kubernetes/config/
   ```

4. Configure all the Deployment & Ingress Configurations

   - **No changes required**: `traefik-deployment.yaml`
   - **Changes required**: `google-load-balancer-ingress.yaml`:
     - Name of the **static ip**
     - Name of **managed certificate resource**
   - **Changes required**: `api-deployment.yaml`:
     - Name of the **deployment**
     - Name of the **container** - recommended to align with the monorepo project.
     - Name of the **container image** - This must line up with image that was created in by Cloud Build service.
     - Change all deployment and service names to your choosing (i.e. `z2p-api-service` to `your-chosen-service-name`)
     - Change the name of the service **port**
   - **Changes required**: `fannout-ingress.yaml`
     - Change the **host** to the domain at which you cluster will be located
     - service **name/port** to your own respective values.

5. Apply all deployments and ingress resources to the cluster

   ```bash
   kubectl apply -f dev-ops/kubernetes/
   ```

6. Wait for all your containers to be provisioned. You can view your Deployments and Ingress resources under **Kubernetes Engine** -> **Workloads/Services & Ingress**

##### Notes

In the Global Load Balancer config, `HTTP` traffic has been disabled so you can only access your cluster via `HTTPS`, hence you will have to also configure your DNS provider (see below). HTTP to HTTPS redirect is coming soong

#### Configure Your DNS Provider

To access your cluster via your domain name, e.g. `api.zero-to-production.dev` you will have to configure your DNS records with your domain name provider. Assuming you are hosting your API at the subdomain `api.your-domain.tld`, then create an **A** record (or **AAAA** if using **IPv6**) that directs your subdomain to the static IP address reserved at **1**. This will take time to propagate (up to 24 hours). Once updated test your cluster is running correctly by visiting the `/healthz` url for your domain (this is the readiness probe route). You should receive status **200** OK response back.

#### Google Cloud Build Trigger - Trigger Update

This repo is configured that any commit (via PR) to the master branch will run a Circle CI workflow that executes [semantic release] to build and release a new semver version based of the commit messages. This process will tag the repo accordingly i.e. `v1.1.3`. This tag can trigger a rebuild of the image and initiate a rolling update of your containers.

1. On Google Cloud, navigate to **Tools > Cloud Build**.
2. Create a new _Push Trigger_.

   - Select `Push new tag` and enter the tag regex as `v.*`. Note this will trigger of any tag starting with `v`, you might want to be more clever with the regex match and only match a semver versioning etc.

   - When selecting the `Build Configuration` select the `Cloud Build Configuration File` option and point it at `/dev-ops/cloudbuild.yaml`

   - Enter the appropriate _substitutions_ for your project

     For this example site:

     - **\_PROJECT_NAME**: `server-api`
     - **\_PROJECT_DIRECTORY**: `server/api`

     The following are used by kubectl to update the image and trigger a rolling update

     - **\_DEPLOYMENT_NAME**: `z2p-api` The name of the K8s deployment
     - **\_CONTAINER_NAME**: `server-api` The name of the specific container
     - **\_CLUSTER_NAME**: `z2p-api-cluster` k8s cluster name
     - **\_CLUSTER_ZONE**: `us-central1-a` k8s cluster zone

Each time a release tag is pushed, i.e `v1.4.1`, the trigger will rebuild the container image, tag the image with with the semver version and set the container image of the kubernetes deployment to the new version. Kubernetes will perform a rolling update ane replace the old containers with ones from the new image.

Please see `dev-ops/cloudbuild.yaml` for further details.

#### Reconfigure Client Application

If you have completed the previous guides you would have deployed the Angular Todo application on Firebase Functions. The application would currently have the API URL configured to point at the AWS Lambda functions. Updated this to point to the Kubernetes API and redeploy you web app..

#### VPC Network Peering (if using Mongo Atlas)

In a real production server you would setup VPC Network Peering between your Mongo Atlas Project and your Google Cloud Project and only whitelist the Google Cloud CIDR range. However this feature is not available for the free tier cluster.

See the [Mongo VPC Peering] docs on how to set up VPC Network Peering

[prerequisites]: https://zero-to-production.dev/guides/getting-started
[docker readme]: https://github.com/jonathonadams/zero-to-production/blob/master/docker/README.md
[traefik]: https://docs.traefik.io/
[google managed certificate]: https://cloud.google.com/kubernetes-engine/docs/how-to/managed-certs
[semantic release]: https://www.npmjs.com/package/semantic-release
[mongo vpc peering]: https://docs.atlas.mongodb.com/security-vpc-peering
