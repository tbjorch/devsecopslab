# ---- build (has npm/yarn/pnpm etc as you like) ----
FROM node:25-alpine@sha256:fd164609b5ab0c6d49bac138ae06c347e72261ec6ae1de32b6aa9f5ee2271110 AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# ---- prod deps (still uses yarn, but not shipped) ----
FROM node:25-alpine@sha256:fd164609b5ab0c6d49bac138ae06c347e72261ec6ae1de32b6aa9f5ee2271110 AS deps
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true --non-interactive \
    && yarn cache clean

# ---- runtime: minimal, node only (NO npm/npx) ----
FROM gcr.io/distroless/nodejs24-debian12:nonroot@sha256:77eb1d627c076bc481706c68ac118fef75ebb35d8ce4d9e711ecd0f675fa9d20
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["dist/main.js"]