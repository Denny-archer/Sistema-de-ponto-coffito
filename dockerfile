# ===============================
# 🔹 Etapa 1: Build do frontend
# ===============================
FROM node:18 AS build
WORKDIR /app

# Copia dependências
COPY package*.json ./
RUN npm install

# Copia código-fonte
COPY . .

# Gera build otimizada
RUN npm run build

# ===============================
# 🔹 Etapa 2: Servir com Nginx
# ===============================
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração personalizada do Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
