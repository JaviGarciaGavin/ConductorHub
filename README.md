ConductorHub (Tengo que intentar sacar alguna forma de dejar el readme.md bien formateado)
📁 Estructura del Proyecto(No soy capaz de que esto quede como un arbol como dios manda)

ConductorHub/
├── config/                 # Configuraciones Symfony
├── migrations/             # Migraciones de base de datos
├── public/                 # Punto de entrada
├── src/                   # Código fuente
│   ├── Entity/            # Entidades de Doctrine
│   ├── Controller/        # Controladores API
│   ├── Repository/        # Repositorios
│   └── Security/          # Configuración seguridad
├── templates/             # Vistas Twig
├── vendor/                # Dependencias PHP
├── .env                   # Variables de entorno
└── composer.json          # Dependencias PHP

🛠️ Tecnologías

Backend

    Symfony 6.3

    API Platform 3.2

    MySQL 8.0

    JWT Authentication

Frontend (Próximamente)

    React 18+

    Bootstrap

    Axios

🛠️ Instalación ---------------------------------------------------------------
Backend

# Instalar dependencias
composer install

# Configurar entorno
cp .env .env.local
# Editar .env.local con la configuración de base de datos

# Crear base de datos y ejecutar migraciones
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Iniciar servidor de desarrollo
symfony server:start

-----ESTADO ACTUAL---------------------------------------------------------------

--->Entidades Implementadas

   -> User - Gestión de usuarios

   -> Project - Administración de proyectos

   -> Ticket - Gestión de incidencias

   -> Comment - Comentarios en tickets

   -> ProjectMember - Miembros de proyectos

   -> ProjectInvitation - Invitaciones a proyectos

   -> Notification - Sistema de notificaciones

--->Características

   -> 25 endpoints REST automáticos

   -> Sistema de roles y permisos

   ->Autenticación JWT

   -> API documentada automáticamente

   -> Base de datos migrada

USO DE LA API   ---------------------------------------------------------------

La API estará disponible en: http://localhost:8000/api con el server de symfony gracias a api platform 
https://api-platform.com/?s=symfony
Viene con una interfaz bastante guay con la que trastear con la api  y probar un poco todos los metodos con sus posts sus gets y sus cosas
(Unica nota para modificar normalmente se tira de put esta utiliza patch pero vamos que tira bien)


COSAS PENDIENTES ---------------------------------------------------------------

  -> Hacer el Front end entero con java script react y alguna libreria chula como anime.js que me he encontrado por ahi y te deja hacer cosas guapas guapas

  -> Seguir con la memoria del proyecto

  -> Probar a pasar todo el proyecto a un portatil a ver si soy capaz de desplegarlo en local para el dia de la presentacion(no prometo nada mi portatil es una patata)
