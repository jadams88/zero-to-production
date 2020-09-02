# ----------------------------------------------------------
# Multi build file - One for building our app and one for production
#
# Seperate containers so that the production container does not
# Contain all the development dependencies and source files, only
# output .js files and production dependencies
# ----------------------------------------------------------

# NOTE: The .dockerignore needs to explicitly allow files to be 'visible' or the build will fail

# ----------------------------------------------------------
# Docker cachs intermediate containers when building images
# and uses the cached containers if there has been no changes to 
# the build before that current step. Becuase of this, it is best
# to install all dependencies at the start so that they are cached and 
# any subsequent changes to source files, libs etc will no require deps to be
# reinstalled. Only changes to your config files will cause reinstalling
# of dependencies.
# ----------------------------------------------------------

# -----------------------------------------
# Build Container - Initail Dependency Install 
# -----------------------------------------
FROM node:12-alpine AS build-setup
USER node

# Set the node environment
ENV NODE_ENV development

ARG PROJECT_DIRECTORY
RUN test -n "$PROJECT_DIRECTORY" || (echo "PROJECT_DIRECTORY  not set" && false)

# Because user is Node, directory must be in /home/node for permission
RUN mkdir -p /home/node/tmp
# set the tmp working directory
WORKDIR /home/node/tmp

# Copy all files required for dependencies to be installed 
COPY --chown=node:node apps/$PROJECT_DIRECTORY/package.json  .
COPY --chown=node:node package-lock.json ./

# IMPROVEMENT
# current bug that `npm ci --only=dev` does not install anything
RUN npm ci --ignore-scripts

# -----------------------------------------
# Production Container - Initail Dependency Install 
# -----------------------------------------
FROM node:12-alpine AS deployment-setup
USER node

# Set the node environment
# This also means only prodcution npm's are installaed
ENV NODE_ENV production
ARG PROJECT_DIRECTORY

# Becuase user is Node, directory must be in /home/node for permission
RUN mkdir -p /home/node/app
# Set
WORKDIR /home/node/app

# Copy the package.json from the app specific directory
# and hte lock file from the root directory
COPY --chown=node:node apps/$PROJECT_DIRECTORY/package.json  ./
COPY --chown=node:node package-lock.json ./

# Install all production dependencies
RUN npm ci --only=prod --unsafe-perm || \
  ((if [ -f npm-debug.log ]; then \
  cat npm-debug.log; \
  fi) && false)


# -----------------------------------------
# Build Container - Build all required projects 
# -----------------------------------------
FROM build-setup as build
USER node

ENV NODE_ENV development
ARG PROJECT_DIRECTORY

WORKDIR /home/node/tmp
RUN mkdir dist


# Copy all files required to build the projects
COPY --chown=node:node angular.json tsconfig.json tsconfig.server.json ./

# Copy all src files
COPY --chown=node:node apps/$PROJECT_DIRECTORY/ ./apps/$PROJECT_DIRECTORY

# Copy all libs. 
# Note: only the required libs will be build in the dist folder and coppied into production
COPY --chown=node:node libs ./libs

# Run the production build task (from app specifig package.json)
COPY --chown=node:node apps/$PROJECT_DIRECTORY/package.json  ./

RUN npm run build:docker

# -----------------------------------------
# Final Production Container 
# -----------------------------------------
FROM deployment-setup as deployment
USER node

ENV NODE_ENV production
ARG PROJECT_DIRECTORY

# Copy the distribution folder from the builder container
COPY --chown=node:node --from=build /home/node/tmp/dist /home/node/app

WORKDIR $PROJECT_DIRECTORY

# Expose port 3000
# This port must match the port for the K8's continer health probe
# It must be exposed else the probe will fail
EXPOSE 3000

# Run the start command
CMD node main.js
