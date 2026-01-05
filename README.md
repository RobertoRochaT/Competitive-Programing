# 🏆 Competitive Programming Platform

Plataforma full-stack para practicar problemas de programación competitiva con datos en tiempo real de LeetCode.

## 📋 Descripción

Este proyecto combina un frontend moderno en React con un backend robusto en Go para proporcionar una experiencia completa de práctica de algoritmos y estructuras de datos.

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **CSS Modules** - Estilos

### Backend
- **Go 1.25+** - Lenguaje del servidor
- **Gorilla Mux** - Router HTTP
- **LeetCode GraphQL API** - Fuente de datos

## 📁 Estructura del Proyecto

```
CPP/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── features/        # Características por módulo
│   │   │   ├── problems/    # Lista de problemas
│   │   │   ├── editor/      # Editor de código
│   │   │   └── match/       # Sistema de matches
│   │   ├── pages/           # Páginas principales
│   │   └── routes/          # Configuración de rutas
│   └── package.json
│
└── backend/                  # API en Go
    ├── cmd/
    │   └── server/          # Punto de entrada
    ├── internal/
    │   ├── handlers/        # Controladores HTTP
    │   ├── services/        # Lógica de negocio
    │   ├── models/          # Modelos de datos
    │   └── middleware/      # Middleware (CORS, etc)
    └── go.mod
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+ y npm
- **Go** 1.21+
- **Git**

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/RobertoRochaT/Competitive-Programing.git
cd Competitive-Programing
```

### 2️⃣ Configurar el Backend

```bash
cd backend

# Descargar dependencias
go mod download

# Compilar el servidor
go build -o bin/server cmd/server/main.go

# Ejecutar el servidor
./bin/server
```

El backend estará disponible en: `http://localhost:8080`

**Endpoints disponibles:**
- `GET /api/health` - Health check
- `GET /api/problems` - Obtener lista de problemas
- `GET /api/problems/{slug}` - Obtener problema específico

### 3️⃣ Configurar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# El archivo .env ya existe con la configuración por defecto

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🎮 Uso

### Desarrollo

**Opción 1: Dos terminales separadas**

Terminal 1 - Backend:
```bash
cd backend
go run cmd/server/main.go
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Opción 2: Usando scripts (próximamente)**
```bash
# En la raíz del proyecto
npm run dev:all
```

### Producción

**Backend:**
```bash
cd backend
go build -o bin/server cmd/server/main.go
PORT=8080 ./bin/server
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🔧 Configuración Avanzada

### Variables de Entorno

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:8080/api
```

**Backend:**
```bash
PORT=8080  # Puerto del servidor (default: 8080)
```

### CORS

El backend está configurado con CORS permitido para todos los orígenes (`*`) por defecto. Para producción, modifica `backend/internal/middleware/cors.go`:

```go
w.Header().Set("Access-Control-Allow-Origin", "https://tu-dominio.com")
```

## 📝 Comandos Útiles

### Backend (Go)

```bash
# Ejecutar el servidor
go run cmd/server/main.go

# Compilar
go build -o bin/server cmd/server/main.go

# Ejecutar tests
go test ./...

# Formatear código
go fmt ./...

# Verificar código
go vet ./...

# Actualizar dependencias
go mod tidy
```

### Frontend (React)

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

## 🐛 Solución de Problemas

### El backend no inicia

1. Verifica que Go esté instalado: `go version`
2. Verifica que las dependencias estén instaladas: `go mod download`
3. Verifica que el puerto 8080 esté libre: `lsof -i :8080`

### El frontend no conecta con el backend

1. Verifica que el backend esté corriendo en `http://localhost:8080`
2. Revisa la consola del navegador para errores de CORS
3. Verifica que `.env` tenga la URL correcta del API

### Errores de compilación en Go

```bash
cd backend
go mod tidy
go clean -modcache
go mod download
```

## 🎯 Características Implementadas

- ✅ Obtener problemas de LeetCode en tiempo real
- ✅ API REST en Go con Gorilla Mux
- ✅ Frontend React con TypeScript
- ✅ Configuración de CORS
- ✅ Manejo de errores
- ✅ Arquitectura modular

## 🚧 Próximas Características

- [ ] Autenticación de usuarios (JWT)
- [ ] Sistema de progreso y estadísticas
- [ ] Editor de código integrado con ejecución
- [ ] Sistema de matches 1v1
- [ ] Base de datos (PostgreSQL)
- [ ] Caché con Redis
- [ ] Tests unitarios y de integración
- [ ] CI/CD con GitHub Actions
- [ ] Dockerización

## 📚 Recursos de Aprendizaje

### Go
- [Tour of Go](https://go.dev/tour/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Go by Example](https://gobyexample.com/)

### React + TypeScript
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [MIT License](LICENSE).

## 👤 Autor

**Roberto Rocha**
- GitHub: [@RobertoRochaT](https://github.com/RobertoRochaT)

## 🙏 Agradecimientos

- [LeetCode](https://leetcode.com/) por proporcionar la API de problemas
- Comunidad de Go y React por las excelentes herramientas y documentación

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!