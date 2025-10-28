# 1) build 단계
FROM node:alpine AS builder
WORKDIR /usr/src/app

# 패키지 설치
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# 2) serve 단계: Nginx로 정적 파일 서빙
FROM nginx:1.29.2-alpine
EXPOSE 80
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf