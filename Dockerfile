FROM node:15.4 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY dist ./dist/
COPY scaleData ./scaleData/
COPY .production.env ./

EXPOSE 3030
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
