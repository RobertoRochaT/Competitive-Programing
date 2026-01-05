#!/bin/bash

# Script para ejecutar el proyecto completo en modo desarrollo
# Ejecuta tanto el backend (Go) como el frontend (React) simultáneamente

set -e  # Salir si cualquier comando falla

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Competitive Programming Platform - Dev Mode  ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar que Go esté instalado
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Error: Go no está instalado${NC}"
    echo -e "${YELLOW}Instala Go desde: https://go.dev/dl/${NC}"
    exit 1
fi

# Verificar que Node esté instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo -e "${YELLOW}Instala Node.js desde: https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Go version: $(go version | cut -d ' ' -f 3)${NC}"
echo -e "${GREEN}✅ Node version: $(node --version)${NC}"
echo ""

# Directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servidores...${NC}"
    kill 0
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo -e "${BLUE}🔧 Iniciando Backend (Go)...${NC}"
cd backend

# Descargar dependencias si es necesario
if [ ! -d "vendor" ]; then
    echo -e "${YELLOW}📦 Descargando dependencias de Go...${NC}"
    go mod download
fi

# Ejecutar el servidor de Go en segundo plano
go run cmd/server/main.go &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}   📡 API: http://localhost:8080/api${NC}"
echo -e "${GREEN}   🏥 Health: http://localhost:8080/api/health${NC}"
echo ""

# Esperar un momento para que el backend inicie
sleep 2

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (React)...${NC}"
cd ../frontend

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias de npm...${NC}"
    npm install
fi

# Ejecutar el servidor de desarrollo de Vite en segundo plano
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🚀 Aplicación ejecutándose:${NC}"
echo -e "${GREEN}   🎨 Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}   📡 Backend:  http://localhost:8080${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener ambos servidores${NC}"
echo ""

# Esperar a que los procesos terminen
wait $BACKEND_PID $FRONTEND_PID
