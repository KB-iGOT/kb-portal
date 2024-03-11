FROM node:18.12.1 AS build

WORKDIR /app

RUN npm install -g @angular/cli@14.2.0
COPY package*.json ./
RUN npm install

COPY . .
RUN ng build --configuration=production --base-href /survey/

# Stage 2: Create a lightweight container with Node.js to serve the Angular application
FROM node:18.12.1 AS final

WORKDIR /usr/src/app
COPY --from=build /app/dist/kb-survey/* ./dist/
RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", "dist", "-p", "80"]

