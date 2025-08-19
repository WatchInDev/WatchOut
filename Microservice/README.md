# Launching
## From PyCharm
### Installing dependencies
To install dependencies, in `Microservice` directory run:
```
uv sync
```
### Running
In `Microservice` directory:
```
python manage.py runserver 8001
```
port is `8081`, because main server will be ran at 8000

## With Docker
To build an image, in `Microservice` directory run:
```
docker build -t wo-microservice:1.0 .
```

To create and run a container, execute command below in directory with `.env` file:
```
docker run -p 8001:8001 --env-file .env.dev -t wo-microservice:1.0 
```