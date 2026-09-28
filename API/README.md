# [API ADVENTURE WORKS TAREA 1]
# Chedrick Daniel Uzaga López, 2021144175

# Actualización de programas y sistema.

Ejecutamos los siguientes comandos para actualizar:

sudo apt update

sudo apt upgrade -y

# Instalación de Docker.

Después de una larga espera de actualizaciones se procedió con la instalación de Docker en Kali para colocar dentro de un contenedor SQL server.

sudo apt install docker.io -y

Para iniciar docker cuando iniciamos Kali

sudo systemctl enable docker --now

Para ejecutar docker sin sudo hacemos:

sudo docker ...

Luego:

sudo usermod -aG docker $USER

y finalmente:

sudo reboot

# SQL Server en docker
Para extraer la imagen de SQL Server 2022 ejecutamos:

docker pull mcr.microsoft.com/mssql/server:2022-latest

Y para comprobar que la instalación fue correcta hacemos

docker images

Debería aparecer algo como 

REPOSITORY                       TAG           IMAGE ID       CREATED       SIZE
mcr.microsoft.com/mssql/server   2022-latest   5b0916c7af8c   3 weeks ago   1.69GB


Ejecutamos los siguientes comandos:

docker run -e "ACCEPT_EULA=Y" \
-e "MSSQL_SA_PASSWORD=UnaContraParaTuBase" \
-p 1433:1433 \
--name unNombreParaTuImagen \
-d \
mcr.microsoft.com/mssql/server:2022-latest

Una vez hecho esto podemos iniciar con las credenciales

docker exec -it elNombreDeTuDocker /opt/mssql-tools18/bin/sqlcmd \
-S localhost \
-U sa \
-P 'LaContraQuePusiste' \
-C

Finalmente restauramos la base de datos de adventureworks y podemos trabajar en lo que son las consultas.

# Manejo de los Scripts

Se crearon procedimientos almacenados para poder obtener, eliminar, actualizar o insertar 
Ademas esto nos ayuda a mantener un nivel de seguridad
Se utilizo la tabla products para manejar el CRUD


# Manejo de los endpoints

Hay 4 endpoits que completan el CRUD, son los siguientes

## GET

http://localhost:3000/api/products
Se envia sin body, ya que es un get

## POST
http://localhost:3000/api/products
Se envia con body
Ejemplo de body:
{
    "Name": "Producto API Test55",
    "ProductNumber": "API-TEST-055",
    "SafetyStockLevel": 10,
    "ReorderPoint": 5,
    "StandardCost": 100.00,
    "ListPrice": 150.00,
    "DaysToManufacture": 2
}

## UPDATE

http://localhost:3000/api/products/1001
Actualizamos un producto en especifico, segun el id que se indique.
Ejemplo del body
{
    "Name": "Producto API Actualizado",
    "ProductNumber": "API-TEST-001",
    "Color": "Red",
    "ListPrice": 200.00
}
## DELETE

http://localhost:3000/api/products/2000
Este funciona simplemente pasando el id del producto
No requiere body.


# Estado del proyecto:
Este proyecto fue hecho basandose en los estandares de programacion
para manejar de forma segura la informacion que se tiene

En la escala del 1 al 10 podemos decir que este proyecto podria alcanzar facilmente
una puntuacion de 9

### Enlace del video:

https://youtu.be/S34hNQKvN7g
