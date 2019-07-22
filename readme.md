# Introduction
This repo is a Node.js GraphQL backend starter-kit using the following tech stack:
1. Apollo Server (as GraphQL API Server): https://www.apollographql.com/docs/apollo-server/
2. Prisma (as Data Access Layer): https://www.prisma.io/
3. MongoDB (as Database): https://www.mongodb.com/

The deployment of the servers will use the following serverless architecure:
1. AWS Lambda <- Apollo Server
2. AWS ECS <- Prisma

The goal of this repo is to provide a production ready starter-kit using the above grahpql tech stack and free serverless services (free at the beginning). There are detail instructions about local development and deployment below.

# Features
- Modulized Graphql resolvers and schema
- Asymmetic JWT (JSON Web Token) for authentication
- Serverless (auto-scale)
- ESLint

# Prerequisites
## For local developement
- Prisma CLI: https://www.prisma.io/docs/prisma-cli-and-configuration/using-the-prisma-cli-alx4/

## For deployment (including those for local development)
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html
- AWS ESC CLI: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html

## OS
- Support all OS. Except the script of generating the public and private key pair not support Windows. You can use your own method to generate the key pair and put them into a `.keys` folder.

# Setup and start local Prisma with (remote) MongoDB
## Config Prisma server docker environment variables
`./prisma/.env.example`
1. Rename the file to `.env`.
2. Set `DB_NAME` with the database name you want to set.
3. Set `PRISMA_MANAGEMENT_API_SECRET` with the secret you want for accessing management api.
4. Set `MONGODB_URL` with the mongodb connection uri of your mongodb instance. You can use MongoDB Atlas free instance for testing https://www.mongodb.com/cloud/atlas.

## Config Prisma client environment variables
`./.env.example`
1. Rename `.env.example` to `.env`.
2. Set `PRISMA_SERVICE_API_SECRET` with the secret you want for accessing service api.
3. Set `PRISMA_MANAGEMENT_API_SECRET` with the management api secret you set at `./prisma/.env`.
4. Set `PRISMA_SERVER_ENDPOINT` to the server endpoint `http://localhost:4466/`.

## Start Prisma server and deploy Prisma service to it
1. Run `cd ./prisma`.
2. Run `docker-compose up -d`.
4. Prisma server now start at `http://localhost:4466/` and connected to your MongoDB. You can access the admin panel at `http://localhost:4466/_admin`.
5. Run `prisma deploy -e ../.env` to deploy Prisma service to the Prisma server.
6. (Optional) Run `prisma token -e ../.env` to generate token for service api when you need access to the admin panel.

# Setup and start local Apollo server
## Generate private and public key pair for apollo server JWT signature
1. Run `sudo sh jwtrs256.sh` to generate private and public key pair for JWT signature.
2. Replace `__JWT_PRIVATE_KEY_PASSPHASE__` at `./settings.example.json` with the generated private key passphase. Leave it empty if you did not set a passphase.
3. Rename `./settings.example.json` to `./settings.json`. 

## Start apollo server
1. At `webpack.config.js`, replace `Dotenv` plugin `path` with `./.env`.
2. Run `yarn`.
3. Run `yarn start`.
4. Apollo server started at `http://localhost:3000`.
5. You can access graphql playground at `http://localhost:3000/playground`.

# Deployment of Apollo Server and Prisma server in serverless structure
## Config serverless deployment
`.serverless.env.example`
1. Rename `.serverless.env.example` to`.serverless.env`
2. Set `APOLLO_SERVER_DEPLOYMENT_STAGE` with `production`.
3. Set `APOLLO_SERVER_DEPLOYMENT_REGION` with the region of deployment you want. (e.g. `ap-northeast-2`)

## Deploy Apollo Server to AWS Lambda using serverless cli
1. Run `yarn deploy` (The serverless cli will ask you to setup aws creditial if it is not set. Please follow this tutorial: https://www.youtube.com/watch?v=KngM5bfpttA).

## Deploy Prisma server to AWS ECS and deploy Prisma service to it
* Please use `prisma` cli version `1.28.3` for now to deploy due to bug. (updated at: 10th July 2019)
* Make sure you `ecs-cli` is at least version `1.15.1` or the deployment will fail. Reference: https://github.com/aws/amazon-ecs-cli/issues/726. (updated at: 22nd July 2019)
1. Go to `./prisma` directory.
2. **(For first time deploy)** Run `ecs-cli configure --cluster __CLUSTER_NAME__ --default-launch-type EC2 --region __REGION_NAME__`. Replace `__CLUSTER_NAME__` with the name you want the cluster to be. Replace `__REGION_NAME__ ` with the region you want to create this cluster.
3. *(For first time deploy)* Run `ecs-cli up --capability-iam --keypair __KEY_PAIR__`. Replace `__KEY_PAIR__` with the key pair name for this cluster.
4. Run `ecs-cli compose service up`.
5. Run `ecs-cli ps` to check if the service is running and get the IP address of the Prisma server (e.g. 15.209.13.222:4466).
6. At file `./.env`, update `PRISMA_SERVER_ENDPOINT` with the IP address of the Prisma server. You can append service name to the end of the IP address to create different services (e.g. http://15.209.13.222:4466/production).
7. Run `prisma deploy -e ../.env` to deploy prisma service to the end point server.
8. Run `prisma token -e ../.env` to generate token for accessing service api (the admin panel).

# Prisma server network security
For security concern, the Prisma server should only be accessible by the Apollo server. To do so, we need to create a static IP for the AWS Lambda hosting the Apollo server and add that to the whitelist of the Prisma server security rules.

## Create static IP for Apollo Server Lambda API.
1. Following this tutorial to create static IP (Elastic IP) for the Apollo Server Lambda API: https://medium.com/financial-engines-techblog/aws-lambdas-with-a-static-outgoing-ip-5174a1e70245. Skip those about creating Lambda functions and Clash of Clans.
2. If you cannot save the VPC settings due to permission problem, following these steps and try again:
  1. Scroll to `Execution role` section.
  2. Click on the link below `Existing role`
  3. Add `AmazonVPCFullAccess` policy to the role.
3. Remember the Elastic IP for the next step.

## Restrict access of Prisma ECS instance with only Apollo Server Lambda API
1. Login AWS ECS web console and find the ECS cluster you created. Go to the `ECS Instances` tab and click on the EC2 instance to configure its security group.
2. Open up port 80, 443 and 4646 and the Elastic IP from the previous section for inbound rules. You can also add the same rule with your IP address to test the Prisma server.

# Todo
- Complete Auth flow.
- Add table of content.
- Make SSH connection between Apollo Server Lambda API and Prisma Server.
- Investigate the needs of restricting outbound connections of Prisma Server to access MongoDB instance only.
- Support different stages of deployment (e.g. `staging`, `production`). There is only `production` stage now. 
- Add local MongoDB for Prisma docker services.