FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_DISABLE_ESLINT=true
ENV TS_SKIP_BUILD_CHECK=true
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]