# ConductorHub 
Sistema de gestión de incidencias para equipos de desarrollo.

## 📁 Estructura del Proyecto (Sujeto a cambio todo)
  ConductorHub/
  ├── backend/ # API Symfony + MySQL
  │ ├── src/ # Entidades y controladores
  │ ├── vendor/ # Dependencias PHP
  │ └── composer.json
  ├── frontend/ # Aplicación React (próximamente)
  ├── .gitignore
  ├── LICENSE
  └── README.md

## 🛠️ Tecnologías

### Backend
- Symfony 6+
- API Platform
- MySQL
- JWT Authentication

### Frontend  
- React 18+
- Bootstrap
- Axios

## 🛠️ Instalación

### Backend
```bash
cd backend
composer install
copy .env.example .env
php bin/console doctrine:migrations:migrate
