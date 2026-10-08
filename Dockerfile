# Imagem do front do UniDash para o CapRover (hml e prd).
#
# Duas fases:
# 1. "build": o Node monta o site (npm run build). As variáveis VITE_ entram aqui, porque o
#    Vite as escreve dentro do código. O CapRover passa as variáveis do app como build args.
# 2. Final: só o nginx com o site pronto. O nginx entrega as telas, repassa /api para o back
#    e põe o cabeçalho que só deixa o Hub abrir o /embed em iframe (nginx/default.conf.template).

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_LINK_CHAMADO
ARG VITE_PORTAL_URL
ARG VITE_EMBED_HUB_ORIGIN
ARG VITE_HUB_URL
ENV VITE_LINK_CHAMADO=$VITE_LINK_CHAMADO \
    VITE_PORTAL_URL=$VITE_PORTAL_URL \
    VITE_EMBED_HUB_ORIGIN=$VITE_EMBED_HUB_ORIGIN \
    VITE_HUB_URL=$VITE_HUB_URL
RUN npm run build


FROM nginx:1.29-alpine

# O nginx troca ${BACK_URL} e ${EMBED_HUB_ORIGIN} do modelo pelas variáveis do app ao ligar
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Valores padrão (hml). Em prd, troque nas variáveis do app no CapRover.
ENV BACK_URL=http://srv-captain--unidash-hml-back:8000 \
    EMBED_HUB_ORIGIN=https://unifecaf-hub-hml.app.unifecaf.edu.br

EXPOSE 80
